import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';

export interface ToolbarData {
  voteName: string | null;
  inspectorName: string | null;
  totalSquare: number | null;
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
  @Input() noDataYet: boolean = true;

  @Output() fileUploaded: EventEmitter<File> = new EventEmitter<File>();
  @Output() export: EventEmitter<ToolbarData> = new EventEmitter<ToolbarData>();
  @Output() add: EventEmitter<void> = new EventEmitter<void>();
  // @Output() delete: EventEmitter<void> = new EventEmitter<void>();
  @Output() toolbarDataChanged: EventEmitter<ToolbarData> = new EventEmitter<ToolbarData>();

  private destroy$: Subject<void> = new Subject<void>();

  public toolbarDataChanged$: Subject<void> = new Subject();

  constructor() {}

  ngOnInit(): void {
    this.toolbarDataChanged$.pipe(debounceTime(1000), takeUntil(this.destroy$)).subscribe(() => {
      this.toolbarDataChanged.emit({
        voteName: this.voteName,
        inspectorName: this.inspectorName,
        totalSquare: this.totalSquare,
      });
    });
  }
}
