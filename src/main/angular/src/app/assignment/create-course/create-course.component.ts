import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
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
export class CreateCourseComponent implements OnInit {
  @ViewChild('successModal', {static: true}) successModal;

  title: string;
  description: string;
  private _assignments: Assignment[] = [];

  newAssignment: string;

  submitting = false;

  id?: string;
  // TODO does not work with Angular Universal
  baseURL = window.location.origin;

  constructor(
    private assignmentService: AssignmentService,
    private courseService: CourseService,
    private modalService: NgbModal,
    private dragulaService: DragulaService,
  ) {
    dragulaService.createGroup('ASSIGNMENTS', {
      moves(el, container, handle) {
        return handle.classList.contains('handle');
      }
    });
  }

  get assignments(): Assignment[] {
    return this._assignments;
  }

  set assignments(value: Assignment[]) {
    this._assignments = value;
    this.saveDraft();
  }

  ngOnInit() {
    this.loadDraft();
  }

  getCourse(): Course {
    return {
      title: this.title,
      description: this.description,
      assignmentIds: this._assignments.map(a => a.id),
    };
  }

  setCourse(course: Course): void {
    this.title = course.title;
    this.description = course.description;

    this._assignments = new Array<Assignment>(course.assignmentIds.length);
    for (let i = 0; i < course.assignmentIds.length; i++) {
      this.assignmentService.get(course.assignmentIds[i]).subscribe(assignment => {
        this._assignments[i] = assignment;
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
      this._assignments.push(assignment);
      this.newAssignment = '';
      this.saveDraft();
    });
  }

  getNewID(): string {
    const pattern = /^.*assignments\/([\w-]+)/;
    const match = pattern.exec(this.newAssignment);
    if (match) {
      return match[1];
    }
    return this.newAssignment;
  }

  removeAssignment(index: number) {
    this._assignments.splice(index, 1);
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
}
