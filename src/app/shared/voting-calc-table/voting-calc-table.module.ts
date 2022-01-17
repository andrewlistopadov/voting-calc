import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VotingCalcTableComponent } from './voting-calc-table.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [VotingCalcTableComponent],
  exports: [VotingCalcTableComponent],
  imports: [CommonModule, FormsModule, NgxDatatableModule, MatInputModule],
})
export class VotingCalcTableModule {}
