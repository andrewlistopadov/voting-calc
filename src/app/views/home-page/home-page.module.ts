import { NgModule } from '@angular/core';
import { VotingCalcTableModule } from 'src/app/shared/voting-calc-table/voting-calc-table.module';
import { VotingCalcToolbarModule } from 'src/app/shared/voting-calc-toolbar/voting-calc-toolbar.module';

import { HomePageRoutingModule } from './home-page-routing.module';
import { HomePageComponent } from './home-page.component';

@NgModule({
  declarations: [HomePageComponent],
  imports: [
    HomePageRoutingModule,
    VotingCalcToolbarModule,
    VotingCalcTableModule,
  ],
})
export class HomePageModule {}
