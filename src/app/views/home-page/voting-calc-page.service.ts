import {Inject, Injectable} from '@angular/core';
import {ColDef, ColumnApi, GridApi, GridReadyEvent, RowNode} from 'ag-grid-community';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {SessionStorageService} from 'src/app/core/browser-storage-services/session-storage.service';
import {StorageServiceBase} from 'src/app/core/browser-storage-services/storage-service-base';
import {downloadCSV} from 'src/app/core/download-file';
import {parseVotingContent} from 'src/app/core/parse-voting-content';
import {getDefaultColDef, normalizeColumns, NormalizedRow, normalizeRows} from 'src/app/core/table-builder';
import {VotingToolbarData} from 'src/app/shared/voting-calc-toolbar/voting-calc-toolbar.component';

const VOTING_DATA_STORAGE_KEY = 'VOTING_DATA_STORAGE_KEY';

interface VotingTableData {
  columnDefs: ColDef[];
  rowData: NormalizedRow[];
}

interface StoredVotingData extends VotingToolbarData, VotingTableData {}

@Injectable({
  providedIn: 'root',
})
export class VotingCalcPageService {
  private toolbarData: VotingToolbarData | null = null;

  public voteName$: Subject<string | null> = new Subject();
  public inspectorName$: Subject<string | null> = new Subject();
  public totalSquare$: Subject<number | null> = new Subject();
  public noDataYet$: BehaviorSubject<boolean> = new BehaviorSubject(Boolean(true));

  private tableData: VotingTableData | null = null;
  private tableRowsMap: Map<string, NormalizedRow> = new Map();

  public defaultColDef$: BehaviorSubject<ColDef> = new BehaviorSubject({});
  public columnDefs$: BehaviorSubject<ColDef[]> = new BehaviorSubject([] as ColDef[]);
  public rowData$: BehaviorSubject<NormalizedRow[]> = new BehaviorSubject([] as NormalizedRow[]);

  public save$: Subject<void> = new Subject();

  private gridApi!: GridApi;
  private gridColumnApi!: ColumnApi;

  public setGridApi(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  public exportVotingCalcDataAsCsv(toolbarData: VotingToolbarData): void {
    const toolbarDataAsCsv = `${toolbarData.voteName},${toolbarData.inspectorName},${toolbarData.totalSquare}`;

    const regexLength = this.gridColumnApi.getAllColumns()!.length - 1;
    const regexPattern = `(${new Array(regexLength).join(',')}+)|(^\s*[\r\n])`; // removes ,,,,,,,, and empty lines
    const regex = new RegExp(regexPattern, 'gm');

    const votingCalcDataAsCsv = this.gridApi
      .getDataAsCsv({
        prependContent: toolbarDataAsCsv,
        suppressQuotes: true, // without "" escaping
      })!
      .replace(regex, '');

    downloadCSV(votingCalcDataAsCsv!, `${toolbarData.voteName}_${toolbarData.inspectorName}.csv`);
  }

  public parseVotingTableContent(content: string): void {
    // ): INormalizedVotingTableContent {
    const votingContent: string[][] = content.split('\n').map((row) => row.split(',').filter((i) => !!i));

    const {voteName, totalSquare, inspectorName, columns, rows} = parseVotingContent(votingContent);

    const normalizedColumns = normalizeColumns(columns);
    const normalizedRows = normalizeRows(columns, rows);

    this.setToolbarData({voteName, inspectorName, totalSquare});
    this.setTableData({columnDefs: normalizedColumns, rowData: normalizedRows});

    this.defaultColDef$.next(getDefaultColDef());

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

  public restoreVotingTableContentFromStorage(): void {
    const restoredData = this.sessionStorage.getItem(VOTING_DATA_STORAGE_KEY) as StoredVotingData;
    if (restoredData) {
      this.noDataYet$.next(false);

      const {voteName, totalSquare, inspectorName, columnDefs, rowData} = restoredData;

      this.setToolbarData({voteName, inspectorName, totalSquare});
      this.setTableData({columnDefs, rowData});

      this.defaultColDef$.next(getDefaultColDef());
    }
  }

  public startAutoSaving(onDestroy: Subject<void>): void {
    this.save$.pipe(debounceTime(5000), takeUntil(onDestroy)).subscribe(() => {
      this.saveDataToStorage();
    });
  }

  private saveDataToStorage(): void {
    // const rowData: string[][] = [];
    // this.gridApi.forEachNode((node: RowNode) => rowData.push(node.data));

    // const columnDefs = this.gridColumnApi.getAllColumns()?.map((i) => i.getColDef());

    const dataToBeStored: StoredVotingData = {
      voteName: this.toolbarData?.voteName || '',
      inspectorName: this.toolbarData?.inspectorName || '',
      totalSquare: this.toolbarData?.totalSquare || 0,
      columnDefs: this.tableData?.columnDefs || [],
      rowData: this.tableData?.rowData || [],
    };

    this.sessionStorage.setItem(VOTING_DATA_STORAGE_KEY, dataToBeStored);
  }

  public toolbarDataChanged(toolbarData: VotingToolbarData): void {
    this.toolbarData = toolbarData;
    this.save$.next();
  }

  private setToolbarData({voteName, inspectorName, totalSquare}: VotingToolbarData): void {
    this.toolbarData = {voteName, inspectorName, totalSquare};

    this.voteName$.next(voteName);
    this.inspectorName$.next(inspectorName);
    this.totalSquare$.next(totalSquare);
  }

  private setTableData({columnDefs, rowData}: VotingTableData): void {
    this.tableData = {columnDefs, rowData};
    this.tableRowsMap = new Map(rowData.map((i) => [i.id, i]));

    this.columnDefs$.next(columnDefs);
    this.rowData$.next(rowData);
  }

  constructor(@Inject(SessionStorageService) private sessionStorage: StorageServiceBase) {}
}
