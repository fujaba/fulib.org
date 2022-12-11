import {Component} from '@angular/core';
import Assignment from '../../../model/assignment';
import {AssignmentContext} from '../../../services/assignment.context';

@Component({
  selector: 'app-edit-assignment-classroom',
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.scss'],
})
export class ClassroomComponent {
  assignment: Assignment;
  saveDraft: () => void;

  encodeURIComponent = encodeURIComponent;

  constructor(
    context: AssignmentContext,
  ) {
    this.assignment = context.assignment;
    this.assignment.classroom ||= {};
    this.saveDraft = context.saveDraft;
  }
}
