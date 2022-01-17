import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import {
  normalizeColumns,
  NormalizedColumn,
  NormalizedRow,
  normalizeRows,
} from 'src/app/core/normalize-table-content';
import { parseVotingContent } from 'src/app/core/parse-voting-content';
import data from './dummy.json';

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

  public columns$: Subject<NormalizedColumn[]> = new Subject();
  public rows$: Subject<NormalizedRow[]> = new Subject();

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
      this.columns$.next(normalizedColumns);
      this.rows$.next(normalizedRows);
    };

    reader.onerror = () => {
      console.error(reader.error);
    };
  }

  constructor() {}

  ngOnInit(): void {
    // setTimeout(() => {
    //   console.log(data);
    //   this.rows$.next(data);
    // }, 100);
  }
}
