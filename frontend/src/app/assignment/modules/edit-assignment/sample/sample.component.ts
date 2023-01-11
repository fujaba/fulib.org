import {Component} from '@angular/core';
import {Marker} from '../../../../shared/model/marker';
import {CreateAssignmentDto} from '../../../model/assignment';
import {CreateEvaluationDto, Evaluation} from '../../../model/evaluation';
import {AssignmentContext} from '../../../services/assignment.context';
import {AssignmentService} from '../../../services/assignment.service';
import {TaskService} from '../../../services/task.service';

@Component({
  selector: 'app-edit-assignment-sample',
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.scss'],
})
export class SampleComponent {
  assignment: CreateAssignmentDto;
  saveDraft: () => void;

  status = 'The sample solution is checked automatically when you change it.';
  evaluations?: Record<string, Evaluation | CreateEvaluationDto>;
  points?: Record<string, number>;
  markers: Marker[] = [];

  constructor(
    private assignmentService: AssignmentService,
    private taskService: TaskService,
    private context: AssignmentContext,
  ) {
    this.assignment = context.assignment;
    this.saveDraft = context.saveDraft;
  }

  check(): void {
    this.saveDraft();
    this.status = 'Checking...';
    this.assignmentService.check(this.assignment).subscribe(response => {
      this.status = 'The sample solution was checked automatically, check the task list for results.';
      this.evaluations = {};
      this.context.evaluations = this.evaluations;
      for (let result of response.results) {
        this.evaluations[result.task] = result;
      }
      this.points = this.taskService.createPointsCache(this.assignment.tasks, this.evaluations);
      this.markers = this.assignmentService.lint(response);
    }, error => {
      this.status = 'Failed to check the sample solution automatically: ' + error.error?.message ?? error.message;
    });
  }

}
