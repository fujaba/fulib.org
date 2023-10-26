import {Component, Input} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { ToastService } from '@mean-stream/ngbx';
import {switchMap} from 'rxjs/operators';
import {CreateEvaluationDto, Evaluation} from '../../../model/evaluation';
import Task from '../../../model/task';
import {ConfigService} from '../../../services/config.service';
import {SolutionService} from '../../../services/solution.service';
import {TelemetryService} from '../../../services/telemetry.service';
import {EvaluationService} from "../../../services/evaluation.service";

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent {
  @Input() tasks?: Task[];
  @Input() editable = false;
  @Input() evaluations?: Record<string, Evaluation | CreateEvaluationDto>;
  @Input() points?: Record<string, number>;

  constructor(
    private telemetryService: TelemetryService,
    private evaluationService: EvaluationService,
    private configService: ConfigService,
    private toastService: ToastService,
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
    this.evaluationService.findByTask(aid, sid, task._id).pipe(
      switchMap(evaluation => evaluation ?
        this.evaluationService.update(aid, sid, evaluation._id, {points}) :
        this.evaluationService.create(aid, sid, {
          task: task._id,
          points,
          author: this.configService.get('name'),
          remark: '',
          snippets: [],
        })),
    ).subscribe({
      // updating evaluations and points is handled by the tasks component
      error: error => {
        this.toastService.error('Quick Evaluation', 'Failed to create or update evaluation', error);
      },
    });
  }
}
