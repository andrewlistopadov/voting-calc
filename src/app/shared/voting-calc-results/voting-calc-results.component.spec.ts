import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingCalcResultsComponent } from './voting-calc-results.component';

describe('VotingCalcResultsComponent', () => {
  let component: VotingCalcResultsComponent;
  let fixture: ComponentFixture<VotingCalcResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VotingCalcResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VotingCalcResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
