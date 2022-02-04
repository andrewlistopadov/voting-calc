import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ConfirmDialogService} from './confirm-dialog.service';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {ConfirmDialogComponent} from './confirm-dialog.component';
@NgModule({
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  declarations: [ConfirmDialogComponent],
  exports: [ConfirmDialogComponent],
  providers: [ConfirmDialogService],
})
export class ConfirmDialogModule {}
