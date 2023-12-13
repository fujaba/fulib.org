import {Component, Input} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { ToastService } from '@mean-stream/ngbx';
import {switchMap} from 'rxjs/operators';
import {CreateEvaluationDto, Evaluation} from '../../../model/evaluation';
import Task from '../../../model/task';
import {ConfigService} from '../../../services/config.service';
import {EvaluationService} from "../../../services/evaluation.service";
import {TaskService} from "../../../services/task.service";

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent {
  @Input({required: true}) allTasks: Task[];
  @Input({required: true}) tasks: Task[];
  @Input() editable = false;
  @Input() evaluations?: Record<string, Evaluation | CreateEvaluationDto>;
  @Input() points?: Record<string, number>;

  constructor(
    private evaluationService: EvaluationService,
    private configService: ConfigService,
    private toastService: ToastService,
    private taskService: TaskService,
    private route: ActivatedRoute,
  ) {
  }

  givePoints(task: Task, points: number) {
    const {aid, sid} = this.route.snapshot.params;
    this.evaluationService.create(aid, sid, {
      task: task._id,
      points,
      author: this.configService.get('name'),
      remark: '',
      snippets: [],
    }).subscribe({
      next: evaluation => {
        if (this.evaluations) {
          this.evaluations[task._id] = evaluation;
        }
        if (this.points && this.evaluations) {
          this.taskService.updatePoints(this.allTasks, this.points, this.evaluations, evaluation);
        }
      },
      error: error => {
        this.toastService.error('Quick Evaluation', 'Failed to create or update evaluation', error);
      },
    });
  }
}
