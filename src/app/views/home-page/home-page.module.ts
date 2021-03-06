import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {AgGridModule} from 'ag-grid-angular';
import {ConfirmDialogModule} from 'src/app/confirm-dialog/confirm-dialog.module';
import {VotingCalcResultsModule} from 'src/app/shared/voting-calc-results/voting-calc-results.module';
import {VotingCalcToolbarModule} from 'src/app/shared/voting-calc-toolbar/voting-calc-toolbar.module';

import {HomePageRoutingModule} from './home-page-routing.module';
import {HomePageComponent} from './home-page.component';

@NgModule({
  declarations: [HomePageComponent],
  imports: [
    CommonModule,
    HomePageRoutingModule,
    VotingCalcToolbarModule,
    VotingCalcResultsModule,
    ConfirmDialogModule,
    AgGridModule.withComponents([]),
  ],
})
export class HomePageModule {}
