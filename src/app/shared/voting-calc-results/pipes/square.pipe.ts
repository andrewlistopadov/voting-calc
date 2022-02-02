import {Pipe, PipeTransform} from '@angular/core';
import Big from 'big.js';
import {CALC_PRECISION_FOR_NUMBERS, CALC_PRECISION_FOR_PERCENTS} from 'src/app/core/global-constants';

let previousTotalSquareValue: number | null = null;
let previousTotalSquare: Big | null = null;

@Pipe({name: 'square'})
export class SquarePipe implements PipeTransform {
  public transform(totalVotedSquare: Big | null, totalSquare: number): string {
    if (totalVotedSquare && totalSquare) {
      previousTotalSquare = previousTotalSquareValue === totalSquare ? previousTotalSquare : new Big(totalSquare);
      const result = `${totalVotedSquare.mul(100).div(totalSquare).round(CALC_PRECISION_FOR_PERCENTS)}%(${totalVotedSquare.round(
        CALC_PRECISION_FOR_NUMBERS,
      )}\u33A1)`;
      return result;
    }

    return '-';
  }
}
