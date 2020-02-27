import {Component, OnInit} from '@angular/core';
import Assignment from '../model/assignment';
import {AssignmentService} from '../assignment.service';

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
  ) {
  }

  ngOnInit() {
  }

  saveDraft(): void {
    // TODO
  }

  addAssignment() {
    const newID = this.getNewID();
    this.assignmentService.get(newID).subscribe(assignment => {
      this.assignments.push(assignment);
      this.newAssignment = '';
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
