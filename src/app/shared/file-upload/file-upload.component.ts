import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'file-upload',
  templateUrl: 'file-upload.component.html',
  styleUrls: ['file-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent {
  @Input() requiredFileType: string = '';

  public fileName = '';

  public onFileSelected(event: Event): void {
    const file: File = (event.target as HTMLInputElement).files![0];

    console.log(file);
    if (file) {
      this.fileName = file.name;
    }
  }
}
