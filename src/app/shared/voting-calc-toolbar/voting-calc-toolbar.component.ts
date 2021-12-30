import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'voting-calc-toolbar',
  templateUrl: './voting-calc-toolbar.component.html',
  styleUrls: ['./voting-calc-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VotingCalcToolbarComponent implements OnInit {
  @Input() inspectorName: string = 'Листопадов';
  @Input() totalSquare: number | null = null;

  public export(): void {}
  constructor() {}

  ngOnInit(): void {}
}
