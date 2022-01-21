import { Injectable } from '@angular/core';
import { ColumnApi, GridApi, GridReadyEvent } from 'ag-grid-community';
import { downloadCSV } from 'src/app/core/download-file';
import { NormalizedRow } from 'src/app/core/normalize-table-content';
import { ToolbarData } from 'src/app/shared/voting-calc-toolbar/voting-calc-toolbar.component';

@Injectable({
  providedIn: 'root',
})
export class VotingCalcPageService {
  private gridApi!: GridApi;
  private gridColumnApi!: ColumnApi;

  public setGridApi(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  public downloadVotingCalcDataAsCsv(toolbarData: ToolbarData): void {
    const toolbarDataAsCsv = `${toolbarData.voteName},${toolbarData.inspectorName},${toolbarData.totalSquare}`;

    const regexLength = this.gridColumnApi.getAllColumns()!.length - 1;
    const regexPattern = `${new Array(regexLength).join(',')}+`;
    const regex = new RegExp(regexPattern, 'g');

    const votingCalcDataAsCsv = this.gridApi
      .getDataAsCsv({
        prependContent: toolbarDataAsCsv,
        suppressQuotes: true, // without "" escaping
      })!
      .replace(regex, ''); // delete empty rows

    downloadCSV(
      votingCalcDataAsCsv!,
      `${toolbarData.voteName}_${toolbarData.inspectorName}.csv`
    );
  }

  private votingCalcColumnValues: Map<string, NormalizedRow> = new Map();

  constructor() {}
}
