import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {forkJoin, Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

import {DragulaService} from 'ng2-dragula';

import Assignment from '../model/assignment';
import {AssignmentService} from '../assignment.service';
import Course from '../model/course';
import {CourseService} from '../course.service';

@Component({
  selector: 'app-create-course',
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.scss'],
})
export class CreateCourseComponent implements OnInit, OnDestroy {
  @ViewChild('successModal', {static: true}) successModal;

  title: string;
  description: string;
  assignments: Assignment[] = [];

  newAssignment: string;

  submitting = false;

  id?: string;

  private readonly origin: string;

  private ownAssignments: Assignment[] = [];

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
    private modalService: NgbModal,
    private dragulaService: DragulaService,
    @Inject(DOCUMENT) document: Document,
  ) {
    this.origin = document.location.origin;
  }

  ngOnInit() {
    this.dragulaService.createGroup('ASSIGNMENTS', {
      moves(el, container, handle): boolean {
        return handle?.classList.contains('handle') ?? false;
      },
    });
    this.loadDraft();
    this.assignmentService.getOwn().subscribe(assignments => {
      this.ownAssignments = assignments;
    });
  }

  ngOnDestroy(): void {
    this.dragulaService.destroy('ASSIGNMENTS');
  }

  getCourse(): Course {
    return {
      title: this.title,
      description: this.description,
      assignments: this.assignments.map(a => a._id!),
    };
  }

  setCourse(course: Course): void {
    this.title = course.title;
    this.description = course.description;

    forkJoin(course.assignments!.map(id => this.assignmentService.get(id))).subscribe(assignments => {
      this.assignments = assignments;
    });
  }

  loadDraft(): void {
    const draft = this.courseService.draft;
    if (draft) {
      this.setCourse(draft);
    }
  }

  saveDraft(): void {
    this.courseService.draft = this.getCourse();
  }

  onImport(file: File): void {
    this.courseService.upload(file).subscribe(result => {
      this.setCourse(result);
      this.saveDraft();
    });
  }

  onExport(): void {
    const course = this.getCourse();
    this.courseService.download(course);
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
    this.courseService.create(this.getCourse()).subscribe(course => {
      this.id = course._id;
      this.submitting = false;
      this.modalService.open(this.successModal, {ariaLabelledBy: 'successModalLabel', size: 'xl'});
    });
  }

  getLink(origin: boolean): string {
    return `${origin ? this.origin : ''}/assignments/courses/${this.id}`;
  }
}
