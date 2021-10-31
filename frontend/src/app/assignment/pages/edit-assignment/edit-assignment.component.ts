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
  loggedIn = false;

  assignment: Assignment = this.createNew();
  markdown?: string;

  checking = false;
  evaluations?: Record<string, CreateEvaluationDto>;
  markers: Marker[] = [];

  submitting = false;

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

  getAssignment(forDraft?: boolean): Assignment {
    return {
      ...this.assignment,
      tasks: this.markdown ? this.taskService.parseTasks(this.markdown) : this.getTasks(this.assignment.tasks, forDraft),
    };
  }

  private getTasks(tasks: Task[], forDraft?: boolean): Task[] {
    return tasks.filter(t => !t.deleted).map(({deleted, collapsed, children, ...rest}) => ({
      ...rest,
      ...(forDraft ? {collapsed} : {}),
      children: this.getTasks(children, forDraft),
    }));
  }

  setAssignment(a: Assignment): void {
    this.assignmentContext.assignment = a;
    this.assignment = a;
    this.assignment.classroom ??= {};
  }

  check(): void {
    this.saveDraft();
    this.checking = true;
    this.assignmentService.check(this.assignment).subscribe(response => {
      this.checking = false;
      this.evaluations = {};
      this.assignmentContext.evaluations = this.evaluations;
      for (let result of response.results) {
        this.evaluations[result.task] = result;
      }
      this.markers = this.assignmentService.lint(response);
    });
  }

  saveDraft(): void {
    if (!this.assignment._id) {
      this.assignmentService.draft = this.getAssignment(true);
    }
  }

  onImport(file: File): void {
    this.assignmentService.upload(file).subscribe(result => {
      this.setAssignment(result);
      this.saveDraft();
      this.evaluations = undefined;
      this.assignmentContext.evaluations = undefined;
      this.markers = [];
    });
  }

  onExport(): void {
    const assignment = this.getAssignment();
    this.assignmentService.download(assignment);
  }

  login(): void {
    this.keycloakService.login().then();
  }

  switchMarkdown() {
    if (this.markdown !== undefined) {
      this.assignment.tasks = this.taskService.parseTasks(this.markdown);
      this.saveDraft();
      this.markdown = undefined;
    } else {
      this.markdown = this.taskService.renderTasks(this.assignment.tasks);
    }
  }

  submit(): void {
    this.submitting = true;
    const assignment = this.getAssignment();
    const operation = assignment._id ? this.assignmentService.update(assignment) : this.assignmentService.create(assignment);
    operation.subscribe(result => {
      this.router.navigate(['/assignments', result._id, 'solutions'], {queryParams: {tab: 'share'}});
    });
  }
}
