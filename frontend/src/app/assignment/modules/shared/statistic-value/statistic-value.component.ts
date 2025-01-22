import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-statistic-value',
  templateUrl: './statistic-value.component.html',
  styleUrls: ['./statistic-value.component.scss'],
  standalone: false,
})
export class StatisticValueComponent {
  @Input() value?: unknown;
  @Input() label?: string;
  @Input() standalone = false;
}
