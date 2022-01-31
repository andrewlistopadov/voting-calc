import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import Big from 'big.js';
import {VotingCalcResultsSheetComponent} from './voting-calc-results-sheet/voting-calc-results-sheet.component';

@Component({
  selector: 'voting-calc-results',
  templateUrl: './voting-calc-results.component.html',
  styleUrls: ['./voting-calc-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VotingCalcResultsComponent implements OnInit {
  @Input() votesCount: number = 0;
  @Input() totalSquare: number = 0;
  @Input() totalVotedSquare: Big | null = null;
  @Input() answersWeights: Map<string, Big>[] = [];
  @Input() columnNames: string[] = [];

  public showVotingResults(): void {
    setTimeout(() => {
      this.bottomSheet.open(VotingCalcResultsSheetComponent, {
        data: {
          votesCount: this.votesCount,
          totalSquare: this.totalSquare,
          totalVotedSquare: this.totalVotedSquare,
          answersWeights: this.answersWeights,
          columnNames: this.columnNames,
        },
      });
    });
  }

  public trackByName(index: number, col: string): string {
    return col;
  }

  constructor(private bottomSheet: MatBottomSheet) {}

  ngOnInit(): void {}
}
