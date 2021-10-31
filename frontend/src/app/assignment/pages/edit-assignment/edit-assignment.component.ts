import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import Assignment from '../../model/assignment';
import Task from '../../model/task';
import {AssignmentContext} from '../../services/assignment.context';
import {AssignmentService} from '../../services/assignment.service';

@Component({
  selector: 'app-create-assignment',
  templateUrl: './edit-assignment.component.html',
  styleUrls: ['./edit-assignment.component.scss'],
  providers: [AssignmentContext],
})
export class EditAssignmentComponent implements OnInit {
  assignment: Assignment = this.createNew();

  steps = [
    ['info', undefined, 'Info'],
    ['classroom', 'github', 'Classroom'],
    ['tasks', undefined, 'Tasks'],
    ['template', undefined, 'Template'],
    ['sample', undefined, 'Sample'],
    ['preview', undefined, 'Preview & Finish'],
  ] as const;

  constructor(
    private assignmentService: AssignmentService,
    private assignmentContext: AssignmentContext,
    public route: ActivatedRoute,
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
