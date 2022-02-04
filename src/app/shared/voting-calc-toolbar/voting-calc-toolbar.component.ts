import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {ROWS_TO_BE_ADDED_COUNT} from 'src/app/core/table-builder';

export interface IVotingToolbarData {
  voteName: string | null;
  inspectorName: string | null;
  totalSquare: string | null;
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
  @Input() totalSquare: string | null = null;
  @Input() noDataYet: boolean = true;

  @Output() filesUploaded: EventEmitter<File[]> = new EventEmitter<File[]>();
  @Output() export: EventEmitter<IVotingToolbarData> = new EventEmitter<IVotingToolbarData>();
  @Output() addRows: EventEmitter<number> = new EventEmitter<number>();
  // @Output() delete: EventEmitter<void> = new EventEmitter<void>();
  @Output() toolbarDataChanged: EventEmitter<IVotingToolbarData> = new EventEmitter<IVotingToolbarData>();

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
