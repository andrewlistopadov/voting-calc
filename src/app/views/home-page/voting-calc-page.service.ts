import {Inject, Injectable} from '@angular/core';
import {CellValueChangedEvent, ColDef, ColumnApi, GridApi, GridReadyEvent} from 'ag-grid-community';
import {Big} from 'big.js';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {SessionStorageService} from 'src/app/core/browser-storage-services/session-storage.service';
import {StorageServiceBase} from 'src/app/core/browser-storage-services/storage-service-base';
import {downloadCSV} from 'src/app/core/download-file';
import {getVotingResultsCalculator, VotingResults} from 'src/app/core/get-voting-results-calculator';
import {parseVotingData} from 'src/app/core/parse-voting-data';
import {createEmptyRows, getColumnDefs, getDefaultColDef, getRowData} from 'src/app/core/table-builder';
import {IVotingToolbarData} from 'src/app/shared/voting-calc-toolbar/voting-calc-toolbar.component';

const VOTING_DATA_STORAGE_KEY = 'VOTING_DATA_STORAGE_KEY';

// const regexPattern = `(${new Array(regexLength).join(',')}+)|^\s*$(?:\r\n?|\n)`; // ` removes ,,,,,,,, and empty lines
const blankLinesPattern = /^\s+$/gm; // the only regex that works fine
const blankLinesRegex = new RegExp(blankLinesPattern);
const numberPattern = /^[0-9]*\.?[0-9]+$/;
const numberRegex = new RegExp(numberPattern);

interface IVotingTableData {
  columnNames: string[];
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
  public votingResults$: BehaviorSubject<string[]> = new BehaviorSubject([] as string[]);

  public votesCount$: Subject<number> = new Subject();
  public totalVotedSquare$: Subject<Big | null> = new Subject();
  public answersWeights$: Subject<Map<string, Big>[]> = new Subject();
  public columnNames$: Subject<string[]> = new Subject();

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

    const rowData = this.getRowData();
    const notEmptyRowDataAsCsv = rowData
      .filter((row, i) => {
        return row.some((v: string) => Boolean(v));
      })
      .reduce((acc, i) => {
        return (acc += i.join(',') + '\r\n');
      }, '');

    // TODO alert You have incomplete rows. Ignore and download?
    const votingData = toolbarDataAsCsv + columnDefsAsCsv + notEmptyRowDataAsCsv;
    downloadCSV(votingData, `${toolbarData.voteName}_${toolbarData.inspectorName}.csv`);

    this._thereAreUnsavedChanges = false;
  }

  public parseVotingData(data: string): void {
    const fixedData = data.replace(blankLinesRegex, '');
    // const votingData: string[][] = fixedData.split(/$[\r\n]/gm).map((row) => row.split(','));
    const votingData: string[][] = fixedData
      .split(/$(?:[\t ]*(?:\r?\n|\r))/gm)
      .map((row) => row.split(','))
      .filter((row) => row.every((i) => i));

    const {voteName, totalSquare, inspectorName, columnNames, rows} = parseVotingData(votingData);

    const columnDefs = getColumnDefs(columnNames);
    const rowData = getRowData(columnNames, rows);

    this.setToolbarData({voteName, inspectorName, totalSquare});
    this.setTableData(columnDefs, rowData);

    setTimeout(() => this.calculateVotingResults(columnNames, rowData));
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
      const columnDefs = getColumnDefs(restoredData.columnNames);

      this.setToolbarData({voteName, inspectorName, totalSquare});
      this.setTableData(columnDefs, rowData);

      setTimeout(() => this.calculateVotingResults(restoredData.columnNames, rowData));
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
      columnNames: this.gridColumnApi.getAllDisplayedColumns()!.map((i) => i.getColDef().headerName!),
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
    let logs = [];

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
      checksum !== row.length && logs.push({i, row: row.join(',')});
    }

    console.timeEnd('calculations');

    const fixedAnswersWeights = answersWeights.slice(2) as Map<string, Big>[];
    const fixedColumnNames = columnNames.slice(2);

    this.votingResultsCalculator = getVotingResultsCalculator(votesCount, totalVotedSquare, fixedAnswersWeights, columnNames.length);

    this.votesCount$.next(votesCount);
    this.totalVotedSquare$.next(totalVotedSquare);
    this.answersWeights$.next(fixedAnswersWeights);
    this.columnNames$.next(fixedColumnNames);

    // console.log('votesCount', votesCount);
    // console.log('totalVotedSquare', totalVotedSquare.toString());
    // console.log('answersWeights', fixedAnswersWeights);
    console.log('Calculate voting results logs:', logs);
  }

  private getRowData(): string[][] {
    const rowData: string[][] = [];
    this.gridApi.forEachNode((node) => rowData.push(node.data));
    return rowData;
  }

  constructor(@Inject(SessionStorageService) private sessionStorage: StorageServiceBase) {}
}
