import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { VotingCalcResultsComponent } from './voting-calc-results.component';
import { VotingCalcResultsSheetComponent } from './voting-calc-results-sheet/voting-calc-results-sheet.component';

@NgModule({
  declarations: [VotingCalcResultsComponent, VotingCalcResultsSheetComponent],
  exports: [VotingCalcResultsComponent],
  imports: [CommonModule, MatIconModule, MatButtonModule, MatBottomSheetModule],
})
export class VotingCalcResultsModule {}
