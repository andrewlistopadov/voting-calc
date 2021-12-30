import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FileUploadComponent } from './file-upload.component';

@NgModule({
  imports: [MatIconModule, MatButtonModule],
  exports: [FileUploadComponent],
  declarations: [FileUploadComponent],
})
export class FileUploadModule {}
