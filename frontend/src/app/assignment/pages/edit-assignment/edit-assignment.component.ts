import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {KeycloakService} from 'keycloak-angular';
import {of, Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {Marker} from '../../../shared/model/marker';
import {UserService} from '../../../user/user.service';
import {AssignmentContext} from '../../services/assignment.context';
import {AssignmentService} from '../../services/assignment.service';
import Assignment from '../../model/assignment';
import {CreateEvaluationDto} from '../../model/evaluation';
import Task from '../../model/task';
import {TaskService} from '../../services/task.service';

@Component({
  selector: 'app-create-assignment',
  templateUrl: './edit-assignment.component.html',
  styleUrls: ['./edit-assignment.component.scss'],
  providers: [AssignmentContext],
})
export class EditAssignmentComponent implements OnInit {
  assignment: Assignment = this.createNew();

  constructor(
    private assignmentService: AssignmentService,
    private users: UserService,
    private keycloakService: KeycloakService,
    private taskService: TaskService,
    private assignmentContext: AssignmentContext,
    public route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.assignmentContext.saveDraft = () => this.saveDraft();

    this.route.params.pipe(
      switchMap(({aid}) => {
        if (aid) {
          return this.assignmentService.get(aid);
        }
        const draft = this.assignmentService.draft;
        if (draft) {
          return of(draft);
        }
        return of(this.createNew());
      }),
    ).subscribe(assignment => this.setAssignment(assignment));
  }

  private createNew(): Assignment {
    return {
      title: '',
      author: '',
      email: '',
      deadline: new Date(),
      description: '',
      tasks: [],
      solution: '',
      templateSolution: '',
      classroom: {},
    };
  }

  private getAssignment(): Assignment {
    return {
      ...this.assignment,
      tasks: this.getTasks(this.assignment.tasks),
    };
  }

  private getTasks(tasks: Task[]): Task[] {
    return tasks.filter(t => !t.deleted).map(({deleted, children, ...rest}) => ({
      ...rest,
      children: this.getTasks(children),
    }));
  }

  setAssignment(a: Assignment): void {
    this.assignmentContext.assignment = a;
    this.assignment = a;
    this.assignment.classroom ??= {};
  }

  saveDraft(): void {
    if (!this.assignment._id) {
      this.assignmentService.draft = this.getAssignment();
    }
  }

  onImport(file: File): void {
    this.assignmentService.upload(file).subscribe(result => {
      this.setAssignment(result);
      this.saveDraft();
      this.assignmentContext.evaluations = undefined;
    });
  }

  onExport(): void {
    const assignment = this.getAssignment();
    this.assignmentService.download(assignment);
  }

}
