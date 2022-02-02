import {Pipe, PipeTransform} from '@angular/core';
import Big from 'big.js';
import {CALC_PRECISION_FOR_NUMBERS, CALC_PRECISION_FOR_PERCENTS} from 'src/app/core/global-constants';

@Pipe({name: 'calcColSingleResult'})
export class CalcColSingleResultPipe implements PipeTransform {
  public transform(answersWeight: Map<string, Big>, colName: string): string {
    let total = new Big(0);
    let max: [string, Big] = ['', new Big(0)];
    [...answersWeight.entries()].forEach((e: [string, Big]) => {
      total = total.plus(e[1]);
      max = e[1]!.gt(max[1]) ? e : max;
    });
    if (max[1].gt(Big(0))) {
      const result = `${colName}:\xa0${max[0]}\xa0-\xa0${max[1].mul(100).div(total).round(CALC_PRECISION_FOR_PERCENTS)}%(${max[1].round(
        CALC_PRECISION_FOR_NUMBERS,
      )}\u33A1)`;
      return result;
    }

    return '-';
  }
}
