import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import ObjectID from 'bson-objectid';
import {KeycloakService} from 'keycloak-angular';
import {of, Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {Marker} from '../../shared/model/marker';
import {UserService} from '../../user/user.service';
import {AssignmentService} from '../assignment.service';
import Assignment from '../model/assignment';
import TaskResult from '../model/task-result';

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
  results?: Record<string, TaskResult>;
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

  getAssignment(): Assignment {
    return {
      ...this.assignment,
      deadline: this.getDeadline(),
      tasks: this.assignment.tasks.filter(t => !t.deleted).map(({deleted, collapsed, ...rest}) => rest),
    };
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
      this.results = {};
      for (let result of response.results) {
        this.results[result.task] = result;
      }
      this.markers = this.assignmentService.lint(response);
    });
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
      this.results = undefined;
      this.markers = [];
    });
  }

  onExport(): void {
    const assignment = this.getAssignment();
    this.assignmentService.download(assignment);
  }

  addTask(): void {
    const id = new ObjectID().toHexString();
    this.assignment.tasks.push({
      _id: id,
      description: '',
      points: 0,
      verification: '',
      collapsed: false,
      deleted: false,
      children: [],
    });
    if (this.results) {
      this.results[id] = {
        task: id,
        points: 0,
        output: '',
      };
    }
    this.saveDraft();
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
