import {Inject, Injectable} from '@angular/core';
import {CellValueChangedEvent, ColDef, ColumnApi, GridApi, GridReadyEvent} from 'ag-grid-community';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {SessionStorageService} from 'src/app/core/browser-storage-services/session-storage.service';
import {StorageServiceBase} from 'src/app/core/browser-storage-services/storage-service-base';
import {downloadCSV} from 'src/app/core/download-file';
import {parseVotingContent} from 'src/app/core/parse-voting-content';
import {createEmptyRows, getColumnDefs, getDefaultColDef, getRowData} from 'src/app/core/table-builder';
import {IVotingToolbarData} from 'src/app/shared/voting-calc-toolbar/voting-calc-toolbar.component';

const VOTING_DATA_STORAGE_KEY = 'VOTING_DATA_STORAGE_KEY';

interface IVotingTableData {
  columnDefs: string[];
  rowData: string[][];
}

interface IVotingData extends IVotingToolbarData, IVotingTableData {}

@Injectable({
  providedIn: 'root',
})
export class VotingCalcPageService {
  private toolbarData: IVotingToolbarData | null = null;

  public voteName$: Subject<string | null> = new Subject();
  public inspectorName$: Subject<string | null> = new Subject();
  public totalSquare$: Subject<number | null> = new Subject();
  public noDataYet$: BehaviorSubject<boolean> = new BehaviorSubject(Boolean(true));

  // private tableData: VotingTableData | null = null;
  // private tableRowsMap: Map<string, NormalizedRow> = new Map();

  public defaultColDef$: BehaviorSubject<ColDef> = new BehaviorSubject({});
  public columnDefs$: BehaviorSubject<ColDef[]> = new BehaviorSubject([] as ColDef[]);
  public rowData$: BehaviorSubject<string[][]> = new BehaviorSubject([] as string[][]);

  public save$: Subject<void> = new Subject();

  private gridApi!: GridApi;
  private gridColumnApi!: ColumnApi;

  public setGridApi(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  public addRows(count: number) {
    const newEmptyRows: string[][] = createEmptyRows(count, this.gridColumnApi.getAllDisplayedColumns().length);
    // updates stored data
    // this.tableData = {...this.tableData!, rowData: [...this.tableData!.rowData, ...newEmptyRows]};
    // newEmptyRows.forEach((i) => this.tableRowsMap.set(i.id, i));
    // adds new rows to the table
    this.gridApi.applyTransaction({add: newEmptyRows});

    this.save$.next();
  }

  // public exportVotingCalcDataAsCsv(toolbarData: VotingToolbarData): void {
  //   const toolbarDataAsCsv = `${toolbarData.voteName},${toolbarData.inspectorName},${toolbarData.totalSquare},`; // `

  //   const regexLength = this.gridColumnApi.getAllColumns()!.length - 1;
  //   const regexPattern = `(${new Array(regexLength).join(',')}+)|^\s*$(?:\r\n?|\n)`; // ` removes ,,,,,,,, and empty lines
  //   const regex = new RegExp(regexPattern, 'gm');

  //   const votingCalcDataAsCsv = this.gridApi
  //     .getDataAsCsv({
  //       prependContent: toolbarDataAsCsv,
  //       suppressQuotes: true, // without "" escaping
  //     })!
  //     .replace(regex, '');

  //   downloadCSV(votingCalcDataAsCsv!, `${toolbarData.voteName}_${toolbarData.inspectorName}.csv`);
  // }

  public exportVotingCalcDataAsCsv(toolbarData: IVotingToolbarData): void {
    const toolbarDataAsCsv = `${toolbarData.voteName},${toolbarData.inspectorName},${toolbarData.totalSquare}\r\n`; // `

    const columnDefsAsCsv =
      this.gridColumnApi
        .getAllDisplayedColumns()!
        .map((i) => i.getColDef().headerName)
        .join(',') + '\r\n';

    let rowData: string[][] = [];
    this.gridApi.forEachNode((node) => rowData.push(node.data));

    const notEmptyRowDataAsCsv = rowData
      .filter((row, i) => {
        return row.some((v: string) => Boolean(v));
      })
      .reduce((acc, i) => {
        return (acc += i.join(',') + '\r\n');
      }, '');

    const votingContent = toolbarDataAsCsv + columnDefsAsCsv + notEmptyRowDataAsCsv;
    downloadCSV(votingContent, `${toolbarData.voteName}_${toolbarData.inspectorName}.csv`);
  }

  public parseVotingTableContent(content: string): void {
    // ): INormalizedVotingTableContent {
    const votingContent: string[][] = content.split('\r\n').map((row) => row.split(',')); //.filter((i) => !!i));

    const {voteName, totalSquare, inspectorName, columns, rows} = parseVotingContent(votingContent);

    const columnDefs = getColumnDefs(columns);
    const rowData = getRowData(columns, rows);

    this.setToolbarData({voteName, inspectorName, totalSquare});
    this.setTableData(columnDefs, rowData);

    // return {
    //   voteName,
    //   inspectorName,
    //   totalSquare,
    //   normalizedColumns,
    //   normalizedRows,
    // };
  }

  public fileUploaded(file: File): void {
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = () => {
      this.parseVotingTableContent(reader!.result as string);
      this.noDataYet$.next(false);
      this.save$.next();
    };

    reader.onerror = () => {
      // TODO update to material popup
      this.noDataYet$.next(true);
      console.error(reader.error);
    };
  }

  public restoreVotingDataFromStorage(): void {
    const restoredData = this.sessionStorage.getItem(VOTING_DATA_STORAGE_KEY) as IVotingData;
    if (restoredData) {
      this.noDataYet$.next(false);

      const {voteName, totalSquare, inspectorName, rowData} = restoredData;
      const columnDefs = getColumnDefs(restoredData.columnDefs);

      this.setToolbarData({voteName, inspectorName, totalSquare});
      this.setTableData(columnDefs, rowData);
    }
  }

  public startAutoSaving(onDestroy: Subject<void>): void {
    this.save$.pipe(debounceTime(2000), takeUntil(onDestroy)).subscribe(() => {
      this.saveVotingDataToStorage();
    });
  }

  private saveVotingDataToStorage(): void {
    // const rowData: string[][] = [];
    // this.gridApi.forEachNode((node: RowNode) => rowData.push(node.data));

    // const columnDefs = this.gridColumnApi.getAllColumns()?.map((i) => i.getColDef());

    const rowData: string[][] = [];
    this.gridApi.forEachNode((node) => rowData.push(node.data));

    const dataToBeStored: IVotingData = {
      voteName: this.toolbarData?.voteName || '',
      inspectorName: this.toolbarData?.inspectorName || '',
      totalSquare: this.toolbarData?.totalSquare || 0,
      columnDefs: this.gridColumnApi.getAllDisplayedColumns()!.map((i) => i.getColDef().headerName!) || [],
      rowData,
    };

    this.sessionStorage.setItem(VOTING_DATA_STORAGE_KEY, dataToBeStored);
  }

  public toolbarDataChanged(toolbarData: IVotingToolbarData): void {
    this.toolbarData = toolbarData;
    this.save$.next();
  }

  public cellValueChanged(e: CellValueChangedEvent): void {
    // e.colDef.field - '3'
    // e.data.id - "c86cca40-79e4-11ec-ae45-595e957334c9"
    // let row = this.tableRowsMap.get(e.data.id);
    // row = {...e.data};
    // row![e.colDef.field!] = e.value;
    // console.log(this.tableRowsMap.get(e.data.id));
    this.save$.next();
  }

  private setToolbarData({voteName, inspectorName, totalSquare}: IVotingToolbarData): void {
    this.toolbarData = {voteName, inspectorName, totalSquare};

    this.voteName$.next(voteName);
    this.inspectorName$.next(inspectorName);
    this.totalSquare$.next(totalSquare);
  }

  private setTableData(columnDefs: ColDef[], rowData: string[][]): void {
    // this.tableData = {columnDefs, rowData};
    // this.tableRowsMap = new Map(rowData.map((i) => [i.id, i]));

    this.columnDefs$.next(columnDefs);
    this.rowData$.next(rowData);
    this.defaultColDef$.next(getDefaultColDef());
  }

  constructor(@Inject(SessionStorageService) private sessionStorage: StorageServiceBase) {}
}
