import {Component, Input} from '@angular/core';
import {EvaluationStatistics} from '../statistics.service';

@Component({
  selector: 'app-statistics-block',
  templateUrl: './statistics-block.component.html',
  styleUrls: ['./statistics-block.component.scss'],
  standalone: false,
})
export class StatisticsBlockComponent {
  @Input() label: string;
  @Input() stats: EvaluationStatistics;
}
