import {Inject, Injectable} from '@angular/core';
import {ColDef, ColumnApi, GridApi, GridReadyEvent, RowNode} from 'ag-grid-community';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {SessionStorageService} from 'src/app/core/browser-storage-services/session-storage.service';
import {StorageServiceBase} from 'src/app/core/browser-storage-services/storage-service-base';
import {downloadCSV} from 'src/app/core/download-file';
import {parseVotingContent} from 'src/app/core/parse-voting-content';
import {getDefaultColDef, normalizeColumns, NormalizedRow, normalizeRows} from 'src/app/core/table-builder';
import {ToolbarData} from 'src/app/shared/voting-calc-toolbar/voting-calc-toolbar.component';

const VOTING_TABLE_CONTENT_STORAGE_KEY = 'VOTING_TABLE_CONTENT_STORAGE_KEY';

interface StoredVotingTableContent {
  voteName: string;
  inspectorName: string;
  totalSquare: number;
  columnDefs: ColDef[];
  rowData: string[][];
}

@Injectable({
  providedIn: 'root',
})
export class VotingCalcPageService {
  private _toolbarData: ToolbarData | null = null;
  public set toolbarData(data: ToolbarData | null) {
    this._toolbarData = data;
  }
  public voteName$: Subject<string | null> = new Subject();
  public inspectorName$: Subject<string | null> = new Subject();
  public totalSquare$: Subject<number | null> = new Subject();

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

  public exportVotingCalcDataAsCsv(toolbarData: ToolbarData): void {
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

    this._toolbarData = {voteName, inspectorName, totalSquare};

    this.voteName$.next(voteName);
    this.inspectorName$.next(inspectorName);
    this.totalSquare$.next(totalSquare);

    this.defaultColDef$.next(getDefaultColDef());
    this.columnDefs$.next(normalizedColumns);
    this.rowData$.next(normalizedRows);

    // return {
    //   voteName,
    //   inspectorName,
    //   totalSquare,
    //   normalizedColumns,
    //   normalizedRows,
    // };
  }

  public restoreVotingTableContentFromStorage(): void {
    const restoredData = this.sessionStorage.getItem(VOTING_TABLE_CONTENT_STORAGE_KEY) as StoredVotingTableContent;
    if (restoredData) {
      const {voteName, totalSquare, inspectorName, columnDefs, rowData} = restoredData;

      this.voteName$.next(voteName);
      this.inspectorName$.next(inspectorName);
      this.totalSquare$.next(totalSquare);

      this.defaultColDef$.next(getDefaultColDef());
      this.columnDefs$.next(columnDefs);
      // this.rowData$.next(rowData);
    }
  }

  public startAutoSaving(onDestroy: Subject<void>): void {
    this.save$.pipe(debounceTime(5000), takeUntil(onDestroy)).subscribe(() => {
      this.saveDataToStorage();
    });
  }

  private saveDataToStorage(): void {
    const rowData: string[][] = [];
    this.gridApi.forEachNode((node: RowNode) => rowData.push(node.data));

    const columnDefs = this.gridColumnApi.getAllColumns()?.map((i) => i.getColDef());

    const dataToBeStored: StoredVotingTableContent = {
      voteName: this._toolbarData?.voteName || '',
      inspectorName: this._toolbarData?.inspectorName || '',
      totalSquare: this._toolbarData?.totalSquare || 0,
      columnDefs: columnDefs || [],
      rowData,
    };

    this.sessionStorage.setItem(VOTING_TABLE_CONTENT_STORAGE_KEY, dataToBeStored);
  }

  private votingCalcColumnValues: Map<string, NormalizedRow> = new Map();

  constructor(@Inject(SessionStorageService) private sessionStorage: StorageServiceBase) {}
}
