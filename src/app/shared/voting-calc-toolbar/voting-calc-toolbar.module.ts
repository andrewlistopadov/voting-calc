import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

import {VotingCalcToolbarComponent} from './voting-calc-toolbar.component';
import {FileUploadModule} from '../file-upload/file-upload.module';

@NgModule({
  declarations: [VotingCalcToolbarComponent],
  exports: [VotingCalcToolbarComponent],
  imports: [CommonModule, FormsModule, FileUploadModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule],
})
export class VotingCalcToolbarModule {}
