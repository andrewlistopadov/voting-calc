import {Inject, Injectable} from '@angular/core';
import {CellValueChangedEvent, ColDef, ColumnApi, GridApi, GridReadyEvent} from 'ag-grid-community';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {SessionStorageService} from 'src/app/core/browser-storage-services/session-storage.service';
import {StorageServiceBase} from 'src/app/core/browser-storage-services/storage-service-base';
import {downloadCSV} from 'src/app/core/download-file';
import {parseVotingData} from 'src/app/core/parse-voting-data';
import {createEmptyRows, getColumnDefs, getDefaultColDef, getRowData} from 'src/app/core/table-builder';
import {IVotingToolbarData} from 'src/app/shared/voting-calc-toolbar/voting-calc-toolbar.component';

const VOTING_DATA_STORAGE_KEY = 'VOTING_DATA_STORAGE_KEY';

// const regexPattern = `(${new Array(regexLength).join(',')}+)|^\s*$(?:\r\n?|\n)`; // ` removes ,,,,,,,, and empty lines
const blankLinesPattern = /^\s+$/gm; // the only regex that works fine
const blankLinesRegex = new RegExp(blankLinesPattern);

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

  private _thereAreUnsavedChanges: boolean = false;
  public get thereAreUnsavedChanges(): boolean {
    return this._thereAreUnsavedChanges;
  }

  public voteName$: Subject<string | null> = new Subject();
  public inspectorName$: Subject<string | null> = new Subject();
  public totalSquare$: Subject<number | null> = new Subject();
  public noDataYet$: BehaviorSubject<boolean> = new BehaviorSubject(Boolean(true));

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
    this.gridApi.applyTransaction({add: newEmptyRows});
    this.save$.next();
  }

  public exportVotingCalcDataAsCsv(toolbarData: IVotingToolbarData): void {
    const toolbarDataAsCsv = `${toolbarData.voteName},${toolbarData.inspectorName},${toolbarData.totalSquare}\r\n`; // `

    const columnDefsAsCsv =
      this.gridColumnApi
        .getAllDisplayedColumns()!
        .map((i) => i.getColDef().headerName)
        .join(',') + '\r\n';

    const rowData = this.getRowData();
    const notEmptyRowDataAsCsv = rowData
      .filter((row, i) => {
        return row.some((v: string) => Boolean(v));
      })
      .reduce((acc, i) => {
        return (acc += i.join(',') + '\r\n');
      }, '');

    const votingData = toolbarDataAsCsv + columnDefsAsCsv + notEmptyRowDataAsCsv;
    downloadCSV(votingData, `${toolbarData.voteName}_${toolbarData.inspectorName}.csv`);

    this._thereAreUnsavedChanges = false;
  }

  public parseVotingData(data: string): void {
    const fixedData = data.replace(blankLinesRegex, '');
    const votingData: string[][] = fixedData.split('\r\n').map((row) => row.split(',')); //.filter((i) => !!i));

    const {voteName, totalSquare, inspectorName, columns, rows} = parseVotingData(votingData);

    const columnDefs = getColumnDefs(columns);
    const rowData = getRowData(columns, rows);

    this.setToolbarData({voteName, inspectorName, totalSquare});
    this.setTableData(columnDefs, rowData);
    // TODO fill the results from scratch
  }

  public fileUploaded(file: File): void {
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = () => {
      this.parseVotingData(reader!.result as string);
      this.noDataYet$.next(false);
      this.save$.next();
      this._thereAreUnsavedChanges = false;
    };

    reader.onerror = () => {
      // TODO update to material popup
      this.noDataYet$.next(true);
      console.error(reader.error);
      this._thereAreUnsavedChanges = false;
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
      // TODO fill the results from scratch
    }
  }

  public startAutoSaving(onDestroy: Subject<void>): void {
    this.save$.pipe(debounceTime(2000), takeUntil(onDestroy)).subscribe(() => {
      this.saveVotingDataToStorage();
    });
  }

  private saveVotingDataToStorage(): void {
    const dataToBeStored: IVotingData = {
      voteName: this.toolbarData?.voteName || '',
      inspectorName: this.toolbarData?.inspectorName || '',
      totalSquare: this.toolbarData?.totalSquare || 0,
      columnDefs: this.gridColumnApi.getAllDisplayedColumns()!.map((i) => i.getColDef().headerName!),
      rowData: this.getRowData(),
    };

    this.sessionStorage.setItem(VOTING_DATA_STORAGE_KEY, dataToBeStored);
  }

  public toolbarDataChanged(toolbarData: IVotingToolbarData): void {
    this.toolbarData = toolbarData;
    this.save$.next();
    this._thereAreUnsavedChanges = true;
  }

  public cellValueChanged(e: CellValueChangedEvent): void {
    // e.column.colId - '3' - column
    // e.rowIndex - 33 - row
    // e.value

    // TODO calc results for particular column
    console.log(e);
    console.log(this.getRowData());
    console.log(this.getRowData()[e.rowIndex!]);

    this.save$.next();
    this._thereAreUnsavedChanges = true;
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

  private getRowData(): string[][] {
    const rowData: string[][] = [];
    this.gridApi.forEachNode((node) => rowData.push(node.data));
    return rowData;
  }

  constructor(@Inject(SessionStorageService) private sessionStorage: StorageServiceBase) {}
}
