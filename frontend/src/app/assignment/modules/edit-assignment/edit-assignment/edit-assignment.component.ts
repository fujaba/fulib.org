import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from '@mean-stream/ngbx';
import {of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import Assignment, {CreateAssignmentDto} from '../../../model/assignment';
import Task from '../../../model/task';
import {AssignmentContext} from '../../../services/assignment.context';
import {AssignmentService} from '../../../services/assignment.service';
import {ConfigService} from '../../../services/config.service';
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
  draft = false;

  constructor(
    private assignmentService: AssignmentService,
    public context: AssignmentContext,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private configService: ConfigService,
  ) {
  }

  ngOnInit(): void {
    this.context.saveDraft = () => this.saveDraft();

    this.route.params.pipe(
      switchMap(({aid}) => {
        const draft = this.assignmentService.loadDraft(aid);
        if (draft) {
          this.draft = true;
          return of(draft);
        }
        if (aid) {
          return this.assignmentService.get(aid);
        }
        return of(this.createNew());
      }),
    ).subscribe((assignment: Assignment | CreateAssignmentDto) => this.context.assignment = assignment);
  }

  private createNew(): CreateAssignmentDto {
    return {
      title: '',
      author: this.configService.get('name'),
      email: this.configService.get('email'),
      deadline: new Date(),
      description: '',
      tasks: [],
      solution: '',
      templateSolution: '',
      classroom: {},
    };
  }

  saveDraft(): void {
    this.assignmentService.saveDraft('_id' in this.context.assignment ? this.context.assignment._id : undefined, this.getAssignment());
    this.draft = true;
  }

  onImport(file: File): void {
    this.assignmentService.upload(file).subscribe(result => {
      const {_id, token, createdBy, ...rest} = result;
      this.context.assignment = rest as Assignment;
      this.context.evaluations = undefined;
      this.saveDraft();
    });
  }

  onExport(): void {
    const {_id, token, createdBy, ...rest} = this.getAssignment() as any;
    this.assignmentService.download(rest);
  }

  submit(): void {
    this.submitting = true;
    const dto = this.getAssignment();
    const _id = '_id' in dto ? dto._id : undefined;
    const operation = _id ? this.assignmentService.update(_id, {
      ...dto,
      token: undefined,
    }) : this.assignmentService.create(dto);
    operation.subscribe(result => {
      this.submitting = false;
      this.toastService.success('Assignment', `Successfully ${_id ? 'updated' : 'created'} assignment`);
      this.assignmentService.deleteDraft(_id);
      this.router.navigate(['/assignments', result._id, 'share']);
    }, error => {
      this.submitting = false;
      this.toastService.error('Assignment', `Failed to ${_id ? 'update' : 'create'} assignment`, error);
    });
  }

  private getAssignment(): Assignment | CreateAssignmentDto {
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
    if (!('_id' in this.context.assignment) || !confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }

    this.assignmentService.deleteDraft(this.context.assignment._id);
    this.router.navigate(['/assignments']);
  }
}
