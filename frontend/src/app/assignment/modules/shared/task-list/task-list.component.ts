import {Component, Input} from '@angular/core';
import {CreateEvaluationDto} from '../../../model/evaluation';
import Task from '../../../model/task';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent {
  @Input() tasks?: Task[];
  @Input() evaluations?: Record<string, CreateEvaluationDto>;
  @Input() points?: Record<string, number>;
}
