import {Component} from '@angular/core';
import {CreateAssignmentDto} from '../../../model/assignment';
import {AssignmentContext} from '../../../services/assignment.context';

@Component({
  selector: 'app-edit-assignment-classroom',
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.scss'],
})
export class ClassroomComponent {
  assignment: CreateAssignmentDto;
  showMoss = false;
  saveDraft: () => void;

  encodeURIComponent = encodeURIComponent;
  mossLanguages = {
    java: 'Java',
    javascript: 'JavaScript',
    python: 'Python',
    c: 'C',
    cc: 'C++',
    csharp: 'C#',
  };

  constructor(
    context: AssignmentContext,
  ) {
    this.assignment = context.assignment;
    this.assignment.classroom ||= {};
    this.showMoss = !!this.assignment.classroom.mossId;
    this.saveDraft = context.saveDraft;
  }
}
