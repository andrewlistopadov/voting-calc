import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

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
    const file: File = (event.target as HTMLInputElement).files![0];

    if (file) {
      this.fileName = file.name;
      this.fileSelected.emit(file);
    }
  }
}
