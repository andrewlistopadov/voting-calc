import {ChangeDetectionStrategy, Component, Inject, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';
import Big from 'big.js';

@Component({
  selector: 'voting-calc-results-sheet',
  templateUrl: './voting-calc-results-sheet.component.html',
  styleUrls: ['./voting-calc-results-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VotingCalcResultsSheetComponent implements OnInit {
  public votesCount: number = 0;
  public totalSquare: number = 0;
  public totalVotedSquare: Big | null = null;
  public answersWeights: Map<string, Big>[] | null = null;
  public columnNames: string[] = [];

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      votesCount: number;
      totalSquare: number;
      totalVotedSquare: Big;
      answersWeights: Map<string, Big>[];
      columnNames: string[];
    },
  ) {}

  ngOnInit(): void {
    this.votesCount = this.data.votesCount;
    this.totalSquare = this.data.totalSquare;
    this.totalVotedSquare = this.data.totalVotedSquare;
    this.answersWeights = this.data.answersWeights;
    this.columnNames = this.data.columnNames;
  }
}
