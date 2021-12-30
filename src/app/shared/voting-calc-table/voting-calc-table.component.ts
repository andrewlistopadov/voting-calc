import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'voting-calc-table',
  templateUrl: './voting-calc-table.component.html',
  styleUrls: ['./voting-calc-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VotingCalcTableComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
