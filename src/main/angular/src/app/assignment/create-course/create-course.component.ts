import {Component, OnInit} from '@angular/core';
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
  title: string;
  description: string;
  assignments: Assignment[] = [];

  newAssignment: string;

  constructor(
    private assignmentService: AssignmentService,
    private courseService: CourseService,
  ) {
  }

  ngOnInit() {
    this.loadDraft();
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
    const pattern = /assignments\/([\w-]+)/;
    const match = pattern.exec(this.newAssignment);
    if (match) {
      return match[1];
    }
    return this.newAssignment;
  }
}
