import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {ConfirmDialogComponent} from './confirm-dialog.component';

@Injectable()
export class ConfirmDialogService {
  private dialogRef!: MatDialogRef<ConfirmDialogComponent>;

  public open(options: {cancelText: string; confirmText: string; message: string; title: string}): void {
    this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: options.title,
        message: options.message,
        cancelText: options.cancelText,
        confirmText: options.confirmText,
      },
    });
  }

  public confirmed(): Observable<any> {
    return this.dialogRef.afterClosed().pipe(
      take(1),
      map((res) => {
        return res;
      }),
    );
  }

  constructor(private dialog: MatDialog) {}
}
