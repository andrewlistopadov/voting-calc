import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {ROWS_TO_BE_ADDED_COUNT} from 'src/app/core/table-builder';

export interface VotingToolbarData {
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
  @Output() export: EventEmitter<VotingToolbarData> = new EventEmitter<VotingToolbarData>();
  @Output() addRows: EventEmitter<number> = new EventEmitter<number>();
  // @Output() delete: EventEmitter<void> = new EventEmitter<void>();
  @Output() toolbarDataChanged: EventEmitter<VotingToolbarData> = new EventEmitter<VotingToolbarData>();

  private destroy$: Subject<void> = new Subject<void>();

  public toolbarDataChanged$: Subject<void> = new Subject();
  public rowsToBeAddedCount = ROWS_TO_BE_ADDED_COUNT;

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
