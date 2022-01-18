import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VotingCalcTableV2Component } from './voting-calc-table-v2.component';
import { AgGridModule } from 'ag-grid-angular';

@NgModule({
  declarations: [VotingCalcTableV2Component],
  exports: [VotingCalcTableV2Component],
  imports: [CommonModule, AgGridModule.withComponents([])],
})
export class VotingCalcTableV2Module {}
