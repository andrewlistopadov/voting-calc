import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { CellValueChangedEvent, ColDef } from 'ag-grid-community';
import { NormalizedRow } from 'src/app/core/normalize-table-content';

@Component({
  selector: 'voting-calc-table',
  templateUrl: './voting-calc-table.component.html',
  styleUrls: ['./voting-calc-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// export class VotingCalcTableV2Component implements {
export class VotingCalcTableComponent implements OnChanges {
  ngOnChanges(c: any): void {
    console.log('ngOnChanges', c);
  }
  @Input() defaultColDef: ColDef = {};
  @Input() columnDefs: ColDef[] = [];
  @Input() rowData: NormalizedRow[] = [];

  @Output() cellValueChanged: EventEmitter<CellValueChangedEvent> =
    new EventEmitter();

  constructor() {}
}
