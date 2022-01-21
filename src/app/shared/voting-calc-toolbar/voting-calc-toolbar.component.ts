import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

export interface ToolbarData {
  voteName: string;
  inspectorName: string;
  totalSquare: number;
}

@Component({
  selector: 'voting-calc-toolbar',
  templateUrl: './voting-calc-toolbar.component.html',
  styleUrls: ['./voting-calc-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VotingCalcToolbarComponent implements OnInit {
  @Input() voteName: string | null = null;
  @Input() inspectorName: string | null = null;
  @Input() totalSquare: number | null = null;

  @Output() fileUploaded: EventEmitter<File> = new EventEmitter<File>();
  @Output() save: EventEmitter<ToolbarData> = new EventEmitter<ToolbarData>();
  @Output() delete: EventEmitter<void> = new EventEmitter<void>();

  public export(): void {}

  // this.zone.runOutsideAngular
  public download(): void {}

  constructor() {}

  ngOnInit(): void {}
}
