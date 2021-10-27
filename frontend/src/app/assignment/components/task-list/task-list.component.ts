import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {CreateEvaluationDto} from '../../model/evaluation';
import Solution from '../../model/solution';
import Task from '../../model/task';
import {TaskService} from '../../services/task.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnChanges {
  @Input() tasks?: Task[];
  @Input() solution?: Solution;
  @Input() evaluations?: Record<string, CreateEvaluationDto>;

  points: Record<string, number> = {};

  constructor(
    private readonly taskService: TaskService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.tasks || changes.evaluations) {
      this.points = this.taskService.createPointsCache(changes.tasks?.currentValue ?? this.tasks ?? [], changes.evaluations?.currentValue ?? this.evaluations ?? []);
    }
  }
}
