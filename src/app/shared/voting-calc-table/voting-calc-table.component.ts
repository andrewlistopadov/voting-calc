import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  TrackByFunction,
  ViewChild,
} from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { findParentByTag } from 'src/app/core/find-parent-by-tag';
import {
  NormalizedColumn,
  NormalizedRow,
} from 'src/app/core/normalize-table-content';

@Component({
  selector: 'voting-calc-table',
  templateUrl: './voting-calc-table.component.html',
  styleUrls: ['./voting-calc-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VotingCalcTableComponent implements OnInit {
  // export class VotingCalcTableComponent implements OnInit, OnChanges {
  //   ngOnChanges(c: any): void {
  //     console.log('ngOnChanges', c);
  //   }
  @Input() columns: NormalizedColumn[] = [];
  @Input() rows: NormalizedRow[] = [];

  public columnMode = ColumnMode;

  @ViewChild(DatatableComponent)
  private datatable!: DatatableComponent;

  public focusout(event: FocusEvent) {
    if (
      !event.relatedTarget ||
      typeof (event.relatedTarget as HTMLElement).dataset.rowIndex ===
        'undefined'
    )
      return;

    const bluredItemRow = findParentByTag(
      event.target as HTMLElement,
      'DATATABLE-ROW-WRAPPER'
    );
    const focusedItemRow = findParentByTag(
      event.relatedTarget as HTMLElement,
      'DATATABLE-ROW-WRAPPER'
    );

    const table = findParentByTag(focusedItemRow, 'DATATABLE-SCROLLER');
    const tableRows = Array.from(
      table!.getElementsByTagName(
        'DATATABLE-ROW-WRAPPER'
      ) as HTMLCollectionOf<HTMLElement>
    );

    const focusedItemRowIndex = tableRows.indexOf(focusedItemRow!);
    const bluredItemRowIndex = tableRows.indexOf(bluredItemRow!);

    const indexesDiff = focusedItemRowIndex - bluredItemRowIndex;
    if (indexesDiff === 0) return;

    const isMovingForward = indexesDiff > 0;
    if (
      (isMovingForward && focusedItemRowIndex < tableRows.length - 2) ||
      (!isMovingForward && focusedItemRowIndex > 1)
    )
      return;

    const focusedItem = event.relatedTarget as HTMLElement;
    // const bluredItem = event.target as HTMLElement;

    // console.log(focusedItem.dataset);
    // console.log(bluredItem.dataset);
    const rowHeight = focusedItemRow!.getBoundingClientRect().height;
    const realFocusedItemRowIndex = parseInt(focusedItem.dataset.rowIndex!);

    // there is no need to scroll if it's the first or last item in the table
    if (
      realFocusedItemRowIndex === 0 ||
      realFocusedItemRowIndex === this.rows!.length - 1
    )
      return;

    // scroll one item up or down
    const topOffset = isMovingForward
      ? rowHeight * (realFocusedItemRowIndex - tableRows.length + 3)
      : rowHeight * (realFocusedItemRowIndex - 1);

    this.scrollTop(topOffset);
    // console.log('focus', focusedItemRowIndex);
    // console.log('blur', bluredItemRowIndex);
    // console.log(topOffset);
  }

  private scrollTop(top: number): void {
    // setTimeout here because on initial page load page scroller subscribes only when table is shown.
    // so first we need to show table, then we need to fire an event
    setTimeout(() => {
      // if (!this.datatable.bodyComponent.scroller) return;
      this.datatable.bodyComponent.scroller.parentElement.scroll({
        // top: index * height,
        top,
        behavior: 'smooth',
      });
    }, 25);
  }

  public trackById: TrackByFunction<{
    id: string;
  }> = (index: number, item: { id: string }) => item.id;

  // public trackById(
  //   i: number,
  //   item: { id: string; [key: string | number]: string }
  // ): string {
  //   return item.id;
  // }

  public trackByName(i: number, item: string): string {
    return item;
  }

  constructor() {}

  ngOnInit(): void {}
}
