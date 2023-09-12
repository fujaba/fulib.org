import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {ToastService} from '@mean-stream/ngbx';
import {DndDropEvent} from 'ngx-drag-drop';
import {Observable, of} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators';
import {ReadAssignmentDto} from '../../../model/assignment';
import Course, {CreateCourseDto} from '../../../model/course';
import {AssignmentService} from '../../../services/assignment.service';
import {CourseService} from '../../../services/course.service';

@Component({
  selector: 'app-create-course',
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.scss'],
})
export class CreateCourseComponent implements OnInit {
  course: Course | CreateCourseDto;
  assignments: ReadAssignmentDto[] = [];

  newAssignment: string;

  submitting = false;

  private ownAssignments: ReadAssignmentDto[] = [];

  search = (text$: Observable<string>): Observable<string[]> => {
    return text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => {
        if (term.length < 2 || this.ownAssignments.length === 0) {
          return [];
        }
        const lowerTerm = term.toLowerCase();
        return this.ownAssignments
          .filter(a => a.title.toLowerCase().indexOf(lowerTerm) >= 0)
          .map(a => `${a.title} (${a._id})`);
      }),
    );
  };

  constructor(
    private assignmentService: AssignmentService,
    private courseService: CourseService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.assignmentService.findOwn().subscribe(assignments => {
      this.ownAssignments = assignments;
    });
    this.route.params.pipe(
      switchMap(({cid}) => cid ? this.courseService.get(cid) : of(this.courseService.draft || {
        title: '',
        assignments: [],
        description: '',
      })),
      tap(course => this.course = course),
      switchMap(course => this.assignmentService.findAll(course.assignments)),
    ).subscribe(assignments => this.assignments = assignments);
  }

  saveDraft(): void {
    this.courseService.draft = this.course;
  }

  onImport(file: File): void {
    this.courseService.upload(file).subscribe(result => {
      this.course = result;
      this.assignmentService.findAll(result.assignments).subscribe(assignments => this.assignments = assignments);
      this.saveDraft();
    });
  }

  onExport(): void {
    this.courseService.download(this.course);
  }

  addAssignment() {
    const newID = this.getNewID();
    this.assignmentService.get(newID).subscribe(assignment => {
      this.assignments.push(assignment);
      this.newAssignment = '';
      this.saveDraft();
    });
  }

  getNewID(): string {
    const pattern = /^.*(?:assignments\/([\w-]+)|\(([\w-]+)\))/;
    const match = pattern.exec(this.newAssignment);
    if (match) {
      return match[1] ?? match[2];
    }
    return this.newAssignment;
  }

  removeAssignment(index: number) {
    this.assignments.splice(index, 1);
    this.saveDraft();
  }

  submit(): void {
    this.submitting = true;
    this.course.assignments = this.assignments.map(a => a._id);
    const id = '_id' in this.course ? this.course._id : undefined;
    (id ? this.courseService.update(id, this.course) : this.courseService.create(this.course)).subscribe(course => {
      this.submitting = false;
      this.router.navigate(['/assignments/courses', course._id, 'share']);
    }, error => {
      this.toastService.error('Course', `Failed to ${id ? 'update' : 'create'} course`, error);
      this.submitting = false;
    });
  }

  dragged(assignment: ReadAssignmentDto) {
    this.assignments.removeFirst(t => t === assignment);
  }

  drop(event: DndDropEvent) {
    if (event.index !== undefined) {
      this.assignments.splice(event.index, 0, event.data);
      this.saveDraft();
    }
  }
}
