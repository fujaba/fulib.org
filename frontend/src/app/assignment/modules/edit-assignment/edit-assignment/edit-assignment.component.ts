import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from 'ng-bootstrap-ext';
import {of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import Assignment from '../../../model/assignment';
import Task from '../../../model/task';
import {AssignmentContext} from '../../../services/assignment.context';
import {AssignmentService} from '../../../services/assignment.service';
import {editAssignmentChildRoutes} from '../edit-assignment-routing.module';

@Component({
  selector: 'app-create-assignment',
  templateUrl: './edit-assignment.component.html',
  styleUrls: ['./edit-assignment.component.scss'],
  providers: [AssignmentContext],
})
export class EditAssignmentComponent implements OnInit {
  steps = editAssignmentChildRoutes;

  submitting = false;

  constructor(
    private assignmentService: AssignmentService,
    public context: AssignmentContext,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.context.saveDraft = () => this.saveDraft();

    this.route.params.pipe(
      switchMap(({aid}) => {
        const draft = this.assignmentService.loadDraft(aid);
        if (draft) {
          return of(draft);
        }
        if (aid) {
          return this.assignmentService.get(aid);
        }
        return of(this.createNew());
      }),
    ).subscribe(assignment => this.setAssignment(assignment));
  }

  private createNew(): Assignment {
    return {
      _id: undefined!,
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

  setAssignment(a: Assignment): void {
    this.context.assignment = a;
    a.classroom ??= {};
  }

  saveDraft(): void {
    this.assignmentService.saveDraft(this.context.assignment._id, this.getAssignment());
  }

  onImport(file: File): void {
    this.assignmentService.upload(file).subscribe(result => {
      this.setAssignment(result);
      this.saveDraft();
      this.context.evaluations = undefined;
    });
  }

  onExport(): void {
    const assignment = this.getAssignment();
    this.assignmentService.download(assignment);
  }

  submit(): void {
    this.submitting = true;
    const assignment = this.getAssignment();
    const operation = assignment._id ? this.assignmentService.update(assignment._id, {
      ...assignment,
      token: undefined,
    }) : this.assignmentService.create(assignment);
    operation.subscribe(result => {
      this.submitting = false;
      this.toastService.success('Assignment', `Successfully ${assignment._id ? 'updated' : 'created'} assignment`);
      this.assignmentService.saveDraft(assignment._id);
      this.router.navigate(['/assignments', result._id, 'share']);
    }, error => {
      this.submitting = false;
      this.toastService.error('Assignment', `Failed to ${assignment._id ? 'update' : 'create'} assignment`, error);
    });
  }

  private getAssignment(): Assignment {
    return {
      ...this.context.assignment,
      tasks: this.getTasks(this.context.assignment.tasks),
    };
  }

  private getTasks(tasks: Task[]): Task[] {
    return tasks.filter(t => !t.deleted).map(({deleted, collapsed, children, ...rest}) => ({
      ...rest,
      children: this.getTasks(children),
    }));
  }

  deleteDraft() {
    if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }

    this.assignmentService.saveDraft(this.context.assignment._id);
    this.router.navigate(['/assignments']);
  }
}
