import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  CellValueChangedEvent,
  ColDef,
  GridReadyEvent,
} from 'ag-grid-community';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  getDefaultColDef,
  normalizeColumns,
  NormalizedRow,
  normalizeRows,
} from 'src/app/core/normalize-table-content';
import { parseVotingContent } from 'src/app/core/parse-voting-content';
import { ToolbarData } from 'src/app/shared/voting-calc-toolbar/voting-calc-toolbar.component';
import { VotingCalcPageService } from './voting-calc-page.service';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements OnInit {
  public file: File | null = null;

  public voteName$: Subject<string | null> = new Subject();
  public inspectorName$: Subject<string | null> = new Subject();
  public totalSquare$: Subject<number | null> = new Subject();

  public defaultColDef$: BehaviorSubject<ColDef> = new BehaviorSubject({});
  public columnDefs$: BehaviorSubject<ColDef[]> = new BehaviorSubject(
    [] as ColDef[]
  );
  public rowData$: BehaviorSubject<NormalizedRow[]> = new BehaviorSubject(
    [] as NormalizedRow[]
  );

  public fileUploaded(file: File): void {
    this.file = file;

    const reader = new FileReader();
    reader.readAsText(this.file);

    reader.onload = () => {
      const votingContent: string[][] = (reader!.result as string)
        .split('\n')
        .map((row) => row.split(',').filter((i) => !!i));

      const { voteName, totalSquare, inspectorName, columns, rows } =
        parseVotingContent(votingContent);

      const normalizedColumns = normalizeColumns(columns);
      const normalizedRows = normalizeRows(columns, rows);

      this.voteName$.next(voteName);
      this.inspectorName$.next(inspectorName);
      this.totalSquare$.next(totalSquare);

      this.defaultColDef$.next(getDefaultColDef());
      this.columnDefs$.next(normalizedColumns);
      this.rowData$.next(normalizedRows);
    };

    reader.onerror = () => {
      // TODO update to material popup
      console.error(reader.error);
    };
  }

  public save(e: ToolbarData): void {
    // e.colDef.field - '3'
    // e.data.id - "c86cca40-79e4-11ec-ae45-595e957334c9"
    this.votingCalcPageService.downloadVotingCalcDataAsCsv(e);
  }

  public cellValueChanged(e: CellValueChangedEvent): void {
    // e.colDef.field - '3'
    // e.data.id - "c86cca40-79e4-11ec-ae45-595e957334c9"
    console.log(e);
  }

  public onGridReady(params: GridReadyEvent): void {
    this.votingCalcPageService.setGridApi(params);
  }

  constructor(private votingCalcPageService: VotingCalcPageService) {}

  ngOnInit(): void {}
}
