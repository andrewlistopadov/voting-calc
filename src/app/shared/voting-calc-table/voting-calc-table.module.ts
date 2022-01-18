import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { VotingCalcTableComponent } from './voting-calc-table.component';

@NgModule({
  declarations: [VotingCalcTableComponent],
  exports: [VotingCalcTableComponent],
  imports: [CommonModule, AgGridModule.withComponents([])],
})
export class VotingCalcTableModule {}
