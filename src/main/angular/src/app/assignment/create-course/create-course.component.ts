import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

import {DragulaService} from 'ng2-dragula';

import Assignment from '../model/assignment';
import {AssignmentService} from '../assignment.service';
import Course from '../model/course';
import {CourseService} from '../course.service';

@Component({
  selector: 'app-create-course',
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.scss']
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
          .map(a => `${a.title} (${a.id})`);
      }),
    );
  }

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
      moves(el, container, handle) {
        return handle.classList.contains('handle');
      }
    });
    this.loadDraft();
    this.assignmentService.getOwn().subscribe(next => {
      this.ownAssignments.push(next);
    });
  }

  ngOnDestroy(): void {
    this.dragulaService.destroy('ASSIGNMENTS');
  }

  getCourse(): Course {
    return {
      title: this.title,
      description: this.description,
      assignmentIds: this.assignments.map(a => a.id),
    };
  }

  setCourse(course: Course): void {
    this.title = course.title;
    this.description = course.description;

    this.assignments = new Array<Assignment>(course.assignmentIds.length);
    for (let i = 0; i < course.assignmentIds.length; i++) {
      this.assignmentService.get(course.assignmentIds[i]).subscribe(assignment => {
        this.assignments[i] = assignment;
      });
    }
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
      return match[1] || match[2];
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
      this.id = course.id;
      this.submitting = false;
      this.modalService.open(this.successModal, {ariaLabelledBy: 'successModalLabel', size: 'xl'});
    });
  }

  getLink(origin: boolean): string {
    return `${origin ? this.origin : ''}/assignments/courses/${this.id}`;
  }
}
