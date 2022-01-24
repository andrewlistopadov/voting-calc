import {AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {CellValueChangedEvent, ColDef, GridReadyEvent} from 'ag-grid-community';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {NormalizedRow} from 'src/app/core/table-builder';
import {VotingToolbarData} from 'src/app/shared/voting-calc-toolbar/voting-calc-toolbar.component';
import {VotingCalcPageService} from './voting-calc-page.service';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements AfterViewInit, OnDestroy {
  public destroy$: Subject<void> = new Subject<void>();
  // public file: File | null = null;

  public voteName$: Subject<string | null> = this.votingCalcPageService.voteName$;
  public inspectorName$: Subject<string | null> = this.votingCalcPageService.inspectorName$;
  public totalSquare$: Subject<number | null> = this.votingCalcPageService.totalSquare$;
  public noDataYet$: BehaviorSubject<boolean> = this.votingCalcPageService.noDataYet$;

  public defaultColDef$: BehaviorSubject<ColDef> = this.votingCalcPageService.defaultColDef$;
  public columnDefs$: BehaviorSubject<ColDef[]> = this.votingCalcPageService.columnDefs$;
  public rowData$: BehaviorSubject<NormalizedRow[]> = this.votingCalcPageService.rowData$;

  public fileUploaded(file: File): void {
    this.votingCalcPageService.fileUploaded(file);
  }

  public export(e: VotingToolbarData): void {
    // e.colDef.field - '3'
    // e.data.id - "c86cca40-79e4-11ec-ae45-595e957334c9"
    this.votingCalcPageService.exportVotingCalcDataAsCsv(e);
  }

  public toolbarDataChanged(toolbarData: VotingToolbarData): void {
    this.votingCalcPageService.toolbarDataChanged(toolbarData);
  }

  public cellValueChanged(e: CellValueChangedEvent): void {
    // e.colDef.field - '3'
    // e.data.id - "c86cca40-79e4-11ec-ae45-595e957334c9"
    console.log(e);
  }

  public onGridReady(params: GridReadyEvent): void {
    this.votingCalcPageService.setGridApi(params);
  }

  constructor(private votingCalcPageService: VotingCalcPageService) {}

  ngAfterViewInit(): void {
    this.votingCalcPageService.restoreVotingTableContentFromStorage();
    this.votingCalcPageService.startAutoSaving(this.destroy$);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
