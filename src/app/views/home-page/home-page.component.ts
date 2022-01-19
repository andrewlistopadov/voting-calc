import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CellValueChangedEvent, ColDef } from 'ag-grid-community';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  getDefaultColDef,
  normalizeColumns,
  NormalizedRow,
  normalizeRows,
} from 'src/app/core/normalize-table-content';
import { parseVotingContent } from 'src/app/core/parse-voting-content';

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

  public cellValueChanged(e: CellValueChangedEvent): void {
    console.log(e);
  }

  constructor() {}

  ngOnInit(): void {}
}
