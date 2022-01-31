import {AfterViewInit, ChangeDetectionStrategy, Component, Inject, OnDestroy} from '@angular/core';
import {CellValueChangedEvent, ColDef, GridReadyEvent} from 'ag-grid-community';
import Big from 'big.js';
import {BehaviorSubject, Subject} from 'rxjs';
import {WINDOW} from 'src/app/core/window.injection-token';
import {IVotingToolbarData} from 'src/app/shared/voting-calc-toolbar/voting-calc-toolbar.component';
import {VotingCalcPageService} from './voting-calc-page.service';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements AfterViewInit, OnDestroy {
  public destroy$: Subject<void> = new Subject<void>();

  public voteName$: Subject<string | null> = this.votingCalcPageService.voteName$;
  public inspectorName$: Subject<string | null> = this.votingCalcPageService.inspectorName$;
  public totalSquare$: Subject<number | null> = this.votingCalcPageService.totalSquare$;
  public noDataYet$: BehaviorSubject<boolean> = this.votingCalcPageService.noDataYet$;

  public defaultColDef$: BehaviorSubject<ColDef> = this.votingCalcPageService.defaultColDef$;
  public columnDefs$: BehaviorSubject<ColDef[]> = this.votingCalcPageService.columnDefs$;
  public rowData$: BehaviorSubject<string[][]> = this.votingCalcPageService.rowData$;

  public votesCount$: Subject<number> = this.votingCalcPageService.votesCount$;
  public totalVotedSquare$: Subject<Big | null> = this.votingCalcPageService.totalVotedSquare$;
  public answersWeights$: Subject<Map<string, Big>[]> = this.votingCalcPageService.answersWeights$;
  public columnNames$: Subject<string[]> = this.votingCalcPageService.columnNames$;

  public fileUploaded(file: File): void {
    this.votingCalcPageService.fileUploaded(file);
  }

  public addRows(count: number): void {
    this.votingCalcPageService.addRows(count);
  }

  public export(e: IVotingToolbarData): void {
    this.votingCalcPageService.exportVotingCalcDataAsCsv(e);
  }

  public toolbarDataChanged(toolbarData: IVotingToolbarData): void {
    this.votingCalcPageService.toolbarDataChanged(toolbarData);
  }

  public cellValueChanged(e: CellValueChangedEvent): void {
    this.votingCalcPageService.cellValueChanged(e);
  }

  public onGridReady(params: GridReadyEvent): void {
    this.votingCalcPageService.setGridApi(params);
  }

  private askLeavePermission = (event: BeforeUnloadEvent): string | null => {
    if (this.votingCalcPageService.thereAreUnsavedChanges) {
      event.preventDefault();
      event.returnValue = 'Changes you made may not be saved. Still want to leave?';
      return event.returnValue;
    } else return null;
  };

  constructor(@Inject(WINDOW) private windowReferenceService: Window, private votingCalcPageService: VotingCalcPageService) {}

  ngAfterViewInit(): void {
    console.warn('uncomment below');
    // this.windowReferenceService.onbeforeunload = this.askLeavePermission;
    this.votingCalcPageService.restoreVotingDataFromStorage();
    this.votingCalcPageService.startAutoSaving(this.destroy$);
  }

  ngOnDestroy(): void {
    this.windowReferenceService.onbeforeunload = null;
    this.destroy$.next();
  }
}
