import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'file-upload',
  templateUrl: 'file-upload.component.html',
  styleUrls: ['file-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent {
  @Input() requiredFileType: string = '';
  @Output() fileSelected: EventEmitter<File> = new EventEmitter<File>();

  public fileName = '';

  public onFileSelected(event: Event): void {
    // TODO update to multiple files
    const file: File = (event.target as HTMLInputElement).files![0];

    if (file) {
      this.fileName = file.name;
      this.fileSelected.emit(file);
      (event.target as HTMLInputElement).value = ''; // resets input to handle same file upload events
    }
  }
}
