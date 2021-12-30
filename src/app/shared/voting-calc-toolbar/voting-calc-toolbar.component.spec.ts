import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingCalcToolbarComponent } from './voting-calc-toolbar.component';

describe('VotingCalcToolbarComponent', () => {
  let component: VotingCalcToolbarComponent;
  let fixture: ComponentFixture<VotingCalcToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VotingCalcToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VotingCalcToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
