import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { CellValueChangedEvent, ColDef } from 'ag-grid-community';
import { NormalizedRow2 } from 'src/app/core/normalize-table-content';

@Component({
  selector: 'voting-calc-table-v2',
  templateUrl: './voting-calc-table-v2.component.html',
  styleUrls: ['./voting-calc-table-v2.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// export class VotingCalcTableV2Component implements {
export class VotingCalcTableV2Component implements OnChanges {
  ngOnChanges(c: any): void {
    console.log('ngOnChanges', c);
  }
  @Input() defaultColDef: ColDef = {};
  @Input() columnDefs: ColDef[] = [];
  @Input() rowData: NormalizedRow2[] = [];

  @Output() cellValueChanged: EventEmitter<CellValueChangedEvent> =
    new EventEmitter();

  constructor() {}
}
