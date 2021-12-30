import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VotingCalcTableComponent } from './voting-calc-table.component';

@NgModule({
  declarations: [VotingCalcTableComponent],
  exports: [VotingCalcTableComponent],
  imports: [CommonModule],
})
export class VotingCalcTableModule {}
