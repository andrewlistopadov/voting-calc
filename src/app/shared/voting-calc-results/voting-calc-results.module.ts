import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

import {VotingCalcResultsComponent} from './voting-calc-results.component';
import {VotingCalcResultsSheetComponent} from './voting-calc-results-sheet/voting-calc-results-sheet.component';
import {SquarePipe} from './pipes/square.pipe';
import {CalcColSingleResultPipe} from './pipes/calc-col-single-result.pipe';

@NgModule({
  declarations: [VotingCalcResultsComponent, VotingCalcResultsSheetComponent, SquarePipe, CalcColSingleResultPipe],
  exports: [VotingCalcResultsComponent],
  imports: [CommonModule, MatIconModule, MatButtonModule, MatBottomSheetModule, MatCardModule],
})
export class VotingCalcResultsModule {}
