import {ChangeDetectionStrategy, Component, Inject, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';
import Big from 'big.js';
import {CALC_PRECISION_FOR_NUMBERS, CALC_PRECISION_FOR_PERCENTS} from 'src/app/core/global-constants';

@Component({
  selector: 'voting-calc-results-sheet',
  templateUrl: './voting-calc-results-sheet.component.html',
  styleUrls: ['./voting-calc-results-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VotingCalcResultsSheetComponent implements OnInit {
  public colspan: number = 1;
  public summary: string = '';
  public votesFraction: string = '';
  public totalVotedSquare: string = '';
  public totalSquare: number = 0;
  public votesCount: number = 0;
  public columnNames: string[] = [];
  public colResults: string[] = [];

  public calcColResults(answersWeight: Map<string, Big>, colName: string): string {
    let total = new Big(0);
    const options: [string, Big][] = [];
    let max: [string, Big] = ['', new Big(0)];

    [...answersWeight.entries()].forEach((e: [string, Big]) => {
      total = total.plus(e[1]);
      options.push(e);
      max = e[1]!.gt(max[1]) ? e : max;
    });

    options.sort((a, b) => a[0].localeCompare(b[0]));

    let result;
    if (options.length) {
      result = options.reduce((acc, o) => {
        acc += `<div ${o[0] === max[0] ? 'class="leading-option"' : ''}>${o[0]}:&nbsp;${o[1]
          .mul(100)
          .div(total)
          .round(CALC_PRECISION_FOR_PERCENTS)}%(${o[1].round(CALC_PRECISION_FOR_NUMBERS)}&#13217;)</div>`;
        return acc;
      }, '');
    } else {
      result = '<div>-</div>';
    }

    return result;
  }

  public trackByIndex(index: number, v: string): number {
    return index;
  }

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
    // console.time('VotingCalcResultsSheetComponent');
    const {votesCount, totalSquare, totalVotedSquare, answersWeights, columnNames} = this.data;

    this.colResults = columnNames.map((colName, i) => this.calcColResults(answersWeights[i], colName));

    this.votesFraction = totalVotedSquare.mul(100).div(totalSquare).round(CALC_PRECISION_FOR_PERCENTS).toString();
    this.totalVotedSquare = totalVotedSquare.round(CALC_PRECISION_FOR_NUMBERS).toString();
    this.totalSquare = totalSquare;
    this.votesCount = votesCount;

    this.colspan = columnNames.length;
    this.columnNames = this.data.columnNames;
    // console.timeEnd('VotingCalcResultsSheetComponent');
  }
}
