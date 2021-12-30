import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingCalcTableComponent } from './voting-calc-table.component';

describe('VotingCalcTableComponent', () => {
  let component: VotingCalcTableComponent;
  let fixture: ComponentFixture<VotingCalcTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VotingCalcTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VotingCalcTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
