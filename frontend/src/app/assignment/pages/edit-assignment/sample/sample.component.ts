import {Component, OnInit} from '@angular/core';
import {Marker} from '../../../../shared/model/marker';
import Assignment from '../../../model/assignment';
import {CreateEvaluationDto} from '../../../model/evaluation';
import {AssignmentContext} from '../../../services/assignment.context';
import {AssignmentService} from '../../../services/assignment.service';
import {TaskService} from '../../../services/task.service';

@Component({
  selector: 'app-edit-assignment-sample',
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.scss'],
})
export class SampleComponent {
  assignment: Assignment;
  saveDraft: () => void;

  checking = false;
  evaluations?: Record<string, CreateEvaluationDto>;
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
    this.checking = true;
    this.assignmentService.check(this.assignment).subscribe(response => {
      this.checking = false;
      this.evaluations = {};
      this.context.evaluations = this.evaluations;
      for (let result of response.results) {
        this.evaluations[result.task] = result;
      }
      this.points = this.taskService.createPointsCache(this.assignment.tasks, this.evaluations);
      this.markers = this.assignmentService.lint(response);
    });
  }

}
