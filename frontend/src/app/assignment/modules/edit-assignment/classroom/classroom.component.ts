import {Component} from '@angular/core';
import {ClassroomInfo} from '../../../model/assignment';
import {AssignmentContext} from '../../../services/assignment.context';

@Component({
  selector: 'app-edit-assignment-classroom',
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.scss'],
})
export class ClassroomComponent {
  classroom: ClassroomInfo;

  encodeURIComponent = encodeURIComponent;

  constructor(
    readonly context: AssignmentContext,
  ) {
    this.classroom = context.assignment.classroom ||= {};
  }
}
