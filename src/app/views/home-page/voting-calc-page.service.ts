import {Inject, Injectable} from '@angular/core';
import {CellValueChangedEvent, ColDef, ColumnApi, GridApi, GridReadyEvent} from 'ag-grid-community';
import {Big} from 'big.js';
import {BehaviorSubject, from, of, Subject} from 'rxjs';
import {bufferCount, catchError, debounceTime, delay, map, mergeMap, take, takeUntil, tap} from 'rxjs/operators';
import {getConfirmDialogOptions, IConfirmDialog} from 'src/app/confirm-dialog/confirm-dialog-options';
import {SessionStorageService} from 'src/app/core/browser-storage-services/session-storage.service';
import {StorageServiceBase} from 'src/app/core/browser-storage-services/storage-service-base';
import {downloadCSV} from 'src/app/core/download-file';
import {getVotingResultsCalculator, VotingResults} from 'src/app/core/get-voting-results-calculator';
import {IParsedVotingData, parseVotingData} from 'src/app/core/parse-voting-data';
import {readFileAsText} from 'src/app/core/read-file';
import {numberRegex} from 'src/app/core/regex';
import {createEmptyRows, getColumnDefs, getDefaultColDef, getAppendedRows as getAppendedRowData} from 'src/app/core/table-builder';
import {IVotingToolbarData} from 'src/app/shared/voting-calc-toolbar/voting-calc-toolbar.component';

const VOTING_DATA_STORAGE_KEY = 'VOTING_DATA_STORAGE_KEY';

interface IVotingTableData {
  columnNames: string[];
  rowData: string[][];
}

interface IVotingData extends IVotingToolbarData, IVotingTableData {}

@Injectable({
  providedIn: 'root',
})
export class VotingCalcPageService {
  private destroy$: Subject<void> = new Subject<void>();

  private toolbarData: IVotingToolbarData | null = null;

  private _thereAreUnsavedChanges: boolean = false;
  public get thereAreUnsavedChanges(): boolean {
    return this._thereAreUnsavedChanges;
  }

  public voteName$: Subject<string | null> = new Subject();
  public inspectorName$: Subject<string | null> = new Subject();
  public totalSquare$: Subject<string | null> = new Subject();
  public noDataYet$: BehaviorSubject<boolean> = new BehaviorSubject(Boolean(true));

  public defaultColDef$: BehaviorSubject<ColDef> = new BehaviorSubject({});
  public columnDefs$: BehaviorSubject<ColDef[]> = new BehaviorSubject([] as ColDef[]);
  public rowData$: BehaviorSubject<string[][]> = new BehaviorSubject([] as string[][]);

  public votesCount$: Subject<number> = new Subject();
  public totalVotedSquare$: Subject<Big | null> = new Subject();
  public answersWeights$: Subject<Map<string, Big>[]> = new Subject();
  public columnNames$: Subject<string[]> = new Subject();

  public confirmDialogOpen$: Subject<IConfirmDialog> = new Subject();

  private votingResultsCalculator: Map<string, (e: CellValueChangedEvent) => VotingResults> | null = null;

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

    const rowData = this.getRowDataFromGrid();
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

  private setVotingData({voteName, totalSquare, inspectorName, columnNames, rowData}: IVotingData): void {
    const columnDefs = getColumnDefs(columnNames);

    this.setToolbarData({voteName, inspectorName, totalSquare});
    this.setTableData(columnDefs, rowData);

    setTimeout(() => this.calculateVotingResults(columnNames, rowData));
  }

  public filesUploaded(files: File[]): void {
    from(files)
      .pipe(
        mergeMap((file: File) => readFileAsText(file)),
        delay(0),
        map((dataAsText: string) => parseVotingData(dataAsText)),
        catchError((e) => of(null)),
        bufferCount(files.length),
        tap((parsedFilesData: (IParsedVotingData | null)[]) => {
          const properlyParsedFilesData = parsedFilesData.filter((i) => Boolean(i));
          if (properlyParsedFilesData.length === parsedFilesData.length) {
            const main = properlyParsedFilesData[0];
            const mainIsValid = main!.totalSquare && main!.voteName && main!.columnNames?.length > 0 && !isNaN(main!.totalSquare as any);
            if (!mainIsValid) {
              this.handleUploadFilesError(`${files[0].name.slice(0, 127)} has incorrect file structure`);
              return;
            }

            let rowData: string[][] = [];
            // multiple files
            if (properlyParsedFilesData.length > 1) {
              const allRows = [...main!.rows];
              for (let i = 1; i < properlyParsedFilesData.length; i++) {
                const current = properlyParsedFilesData[i];
                const valid =
                  main!.totalSquare.localeCompare(current!.totalSquare) === 0 &&
                  main!.voteName.localeCompare(current!.voteName) === 0 &&
                  main!.columnNames.every((c, i) => c.localeCompare(current!.columnNames[i]) === 0);
                if (valid) {
                  allRows.push(...current!.rows);
                  main!.inspectorName += '_' + current!.inspectorName;
                } else {
                  this.handleUploadFilesError(`${files[i].name.slice(0, 127)} has incorrect file structure`);
                  return;
                }
              }
              rowData = getAppendedRowData(main!.columnNames, allRows);
            } else {
              // single file
              rowData = getAppendedRowData(main!.columnNames, main!.rows);
            }
            this.setVotingData({...main!, rowData});

            this.noDataYet$.next(false);
            this._thereAreUnsavedChanges = false;
            this.save$.next();
          } else {
            this.handleUploadFilesError('There is incorrect file structure');
            return;
          }
        }),
        take(1),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {});
  }

  private handleUploadFilesError(message: string): void {
    this.noDataYet$.next(true);

    this.defaultColDef$.next({});
    this.columnDefs$.next([]);
    this.rowData$.next([]);

    this._thereAreUnsavedChanges = false;
    this.confirmDialogOpen$.next(getConfirmDialogOptions({cancelText: '', title: 'Upload file fail', message}));
  }

  public restoreVotingDataFromStorage(): void {
    const restoredData = this.sessionStorage.getItem(VOTING_DATA_STORAGE_KEY) as IVotingData;
    if (restoredData) {
      this.noDataYet$.next(false);
      this.setVotingData(restoredData);
    }
  }

  public startAutoSaving(destroy$: Subject<void>): void {
    this.destroy$ = destroy$;
    this.save$.pipe(debounceTime(2000), takeUntil(this.destroy$)).subscribe(() => {
      this.saveVotingDataToStorage();
    });
  }

  private saveVotingDataToStorage(): void {
    const dataToBeStored: IVotingData = {
      voteName: this.toolbarData?.voteName || '',
      inspectorName: this.toolbarData?.inspectorName || '',
      totalSquare: this.toolbarData?.totalSquare || '',
      columnNames: this.gridColumnApi.getAllDisplayedColumns()!.map((i) => i.getColDef().headerName!),
      rowData: this.getRowDataFromGrid(),
    };

    this.sessionStorage.setItem(VOTING_DATA_STORAGE_KEY, dataToBeStored);
  }

  public toolbarDataChanged(toolbarData: IVotingToolbarData): void {
    this.toolbarData = toolbarData;
    this.save$.next();
    this._thereAreUnsavedChanges = true;
  }

  public cellValueChanged(e: CellValueChangedEvent): void {
    const {votesCount, totalVotedSquare, answersWeights}: VotingResults = this.votingResultsCalculator!.get(e.colDef.field!)!(e);
    votesCount && this.votesCount$.next(votesCount);
    totalVotedSquare && this.totalVotedSquare$.next(totalVotedSquare);
    answersWeights && this.answersWeights$.next(answersWeights);

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
    this.columnDefs$.next(columnDefs);
    this.rowData$.next(rowData);
    this.defaultColDef$.next(getDefaultColDef());
  }

  private calculateVotingResults(columnNames: string[], rowData: string[][]): void {
    console.time('calculations');

    let votesCount = 0;
    let totalVotedSquare = new Big(0);
    let incompleteRows = [];

    // skips first 2 items because we don't need maps for row id and square
    const answersWeights: (Map<string, Big> | null)[] = Array.from(new Array(columnNames.length)).map((_, i) => (i > 1 ? new Map() : null));

    for (let i = 0; i < rowData.length; i++) {
      const row = rowData[i];
      let checksum = 0;

      row[0] && ++votesCount && ++checksum;
      const weightExists = numberRegex.test(row[1]);

      if (weightExists) {
        checksum++;

        const voteWeight = new Big(row[1]);
        totalVotedSquare = totalVotedSquare.plus(voteWeight);

        for (let j = 2; j < row.length; j++) {
          const answerKey = row[j];
          if (answerKey) {
            checksum++;

            let weightOfKey = answersWeights[j]!.get(answerKey) || new Big(0);
            answersWeights[j]!.set(answerKey, weightOfKey.plus(voteWeight));
          }
        }
      }
      checksum > 0 && checksum !== row.length && incompleteRows.push({i, row: row.join(',')});
    }

    console.timeEnd('calculations');

    const fixedAnswersWeights = answersWeights.slice(2) as Map<string, Big>[];
    const fixedColumnNames = columnNames.slice(2);

    this.votingResultsCalculator = getVotingResultsCalculator(votesCount, totalVotedSquare, fixedAnswersWeights, columnNames.length);

    this.votesCount$.next(votesCount);
    this.totalVotedSquare$.next(totalVotedSquare);
    this.answersWeights$.next(fixedAnswersWeights);
    this.columnNames$.next(fixedColumnNames);

    console.log('Incomplete rows:', incompleteRows);
  }

  private getRowDataFromGrid(): string[][] {
    const rowData: string[][] = [];
    this.gridApi.forEachNode((node) => rowData.push(node.data));
    return rowData;
  }

  constructor(@Inject(SessionStorageService) private sessionStorage: StorageServiceBase) {}
}
