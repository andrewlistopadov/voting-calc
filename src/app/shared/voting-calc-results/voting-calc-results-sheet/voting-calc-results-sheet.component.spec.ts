import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingCalcResultsSheetComponent } from './voting-calc-results-sheet.component';

describe('VotingCalcResultsSheetComponent', () => {
  let component: VotingCalcResultsSheetComponent;
  let fixture: ComponentFixture<VotingCalcResultsSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VotingCalcResultsSheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VotingCalcResultsSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
