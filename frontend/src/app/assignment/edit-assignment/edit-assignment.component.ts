import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {KeycloakService} from 'keycloak-angular';
import {of, Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {Marker} from '../../shared/model/marker';
import {UserService} from '../../user/user.service';
import {AssignmentService} from '../assignment.service';
import Assignment from '../model/assignment';
import {CreateEvaluationDto} from '../model/evaluation';
import Task from '../model/task';

@Component({
  selector: 'app-create-assignment',
  templateUrl: './edit-assignment.component.html',
  styleUrls: ['./edit-assignment.component.scss'],
})
export class EditAssignmentComponent implements OnInit, OnDestroy {
  collapse = {
    solution: false,
    templateSolution: false,
  };
  loggedIn = false;

  assignment: Assignment = this.createNew();
  deadlineDate?: string;
  deadlineTime?: string;

  checking = false;
  evaluations?: Record<string, CreateEvaluationDto>;
  markers: Marker[] = [];

  submitting = false;

  private userSubscription: Subscription;

  constructor(
    private assignmentService: AssignmentService,
    private users: UserService,
    private keycloakService: KeycloakService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
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

    this.userSubscription = this.users.current$.subscribe(user => {
      if (!user) {
        return;
      }

      this.loggedIn = true;
      if (user.firstName && user.lastName) {
        this.assignment.author = `${user.firstName} ${user.lastName}`;
      }
      if (user.email) {
        this.assignment.email = user.email;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
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

  getDeadline(): Date | undefined {
    return this.deadlineDate ? new Date(this.deadlineDate + ' ' + (this.deadlineTime ?? '00:00')) : undefined;
  }

  getAssignment(forDraft?: boolean): Assignment {
    return {
      ...this.assignment,
      deadline: this.getDeadline(),
      tasks: this.getTasks(this.assignment.tasks, forDraft),
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
    this.assignment = a;
    this.assignment.classroom ??= {};
    const deadline = a.deadline;
    if (deadline) {
      const year = deadline.getFullYear();
      const month = String(deadline.getMonth() + 1).padStart(2, '0');
      const day = String(deadline.getDate()).padStart(2, '0');
      this.deadlineDate = `${year}-${month}-${day}`;

      const hour = String(deadline.getHours()).padStart(2, '0');
      const minute = String(deadline.getMinutes()).padStart(2, '0');
      const second = String(deadline.getSeconds()).padStart(2, '0');
      this.deadlineTime = `${hour}:${minute}:${second}`;
    } else {
      this.deadlineDate = undefined;
      this.deadlineTime = undefined;
    }

    this.collapse.solution = !a.solution;
    this.collapse.templateSolution = !a.templateSolution;
  }

  check(): void {
    this.saveDraft();
    this.checking = true;
    this.assignmentService.check(this.assignment).subscribe(response => {
      this.checking = false;
      this.evaluations = {};
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

  submit(): void {
    this.submitting = true;
    const assignment = this.getAssignment();
    const operation = assignment._id ? this.assignmentService.update(assignment) : this.assignmentService.create(assignment);
    operation.subscribe(result => {
      this.router.navigate(['/assignments', result._id, 'solutions'], {queryParams: {share: true}});
    });
  }
}
