import {Component, Input} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {CreateEvaluationDto, Evaluation} from '../../../model/evaluation';
import Task from '../../../model/task';
import {ConfigService} from '../../../services/config.service';
import {SolutionService} from '../../../services/solution.service';
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
    private solutionService: SolutionService,
    private configService: ConfigService,
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

  givePoints(task: Task, points: number) {
    const {aid, sid} = this.route.snapshot.params;
    this.solutionService.getEvaluationByTask(aid, sid, task._id).pipe(
      switchMap(evaluation => evaluation ?
        this.solutionService.updateEvaluation(aid, sid, evaluation._id, {points}) :
        this.solutionService.createEvaluation(aid, sid, {
          task: task._id,
          points,
          author: this.configService.get('name'),
          remark: '',
          snippets: [],
        })),
    ).subscribe(); // updating evaluations and points is handled by the tasks component
  }
}
