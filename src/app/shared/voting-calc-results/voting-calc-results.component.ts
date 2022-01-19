import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NormalizedRow } from 'src/app/core/normalize-table-content';
import { VotingCalcResultsSheetComponent } from './voting-calc-results-sheet/voting-calc-results-sheet.component';

@Component({
  selector: 'voting-calc-results',
  templateUrl: './voting-calc-results.component.html',
  styleUrls: ['./voting-calc-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VotingCalcResultsComponent implements OnInit {
  @Input() rowData: NormalizedRow[] = [];

  public showVotingResults(): void {
    this.bottomSheet.open(VotingCalcResultsSheetComponent);
  }

  constructor(private bottomSheet: MatBottomSheet) {}

  ngOnInit(): void {}
}
