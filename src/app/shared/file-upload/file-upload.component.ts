import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'file-upload',
  templateUrl: 'file-upload.component.html',
  styleUrls: ['file-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent {
  @Input() requiredFileType: string = '';
  @Output() filesSelected: EventEmitter<File[]> = new EventEmitter<File[]>();

  public fileNames: string = '';

  public onFilesSelected(event: Event): void {
    // TODO update to multiple files
    const files: File[] = Array.from((event.target as HTMLInputElement).files!);

    if (files.length) {
      this.fileNames = files.reduce((acc, f) => {
        acc += f.name + '; ';
        return acc;
      }, '');
      this.filesSelected.emit(files);
      (event.target as HTMLInputElement).value = ''; // resets input to handle same file upload events
    }
  }
}
