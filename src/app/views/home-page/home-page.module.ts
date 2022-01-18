import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VotingCalcTableV2Module } from 'src/app/shared/voting-calc-table-v2/voting-calc-table-v2.module';
import { VotingCalcTableModule } from 'src/app/shared/voting-calc-table/voting-calc-table.module';
import { VotingCalcToolbarModule } from 'src/app/shared/voting-calc-toolbar/voting-calc-toolbar.module';

import { HomePageRoutingModule } from './home-page-routing.module';
import { HomePageComponent } from './home-page.component';

@NgModule({
  declarations: [HomePageComponent],
  imports: [
    CommonModule,
    HomePageRoutingModule,
    VotingCalcToolbarModule,
    VotingCalcTableV2Module,
  ],
})
export class HomePageModule {}
