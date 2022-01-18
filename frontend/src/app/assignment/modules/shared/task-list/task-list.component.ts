import {Component, Input} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CreateEvaluationDto, Evaluation} from '../../../model/evaluation';
import Task from '../../../model/task';
import {TelemetryService} from '../../../services/telemetry.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent {
  @Input() tasks?: Task[];
  @Input() evaluations?: Record<string, Evaluation | CreateEvaluationDto>;
  @Input() points?: Record<string, number>;

  constructor(
    private telemetryService: TelemetryService,
    private route: ActivatedRoute,
  ) {
  }

  openTelemetry(task: Task) {
    const {aid, sid} = this.route.snapshot.params;
    this.telemetryService.create(aid, sid, {
      task: task._id,
      timestamp: new Date(),
      action: 'openEvaluation',
    }).subscribe();
  }
}
