import {Component} from '@angular/core';
import Assignment from '../../../model/assignment';
import {AssignmentContext} from '../../../services/assignment.context';

@Component({
  selector: 'app-edit-assignment-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss'],
})
export class TemplateComponent {
  assignment: Assignment;
  saveDraft: () => void;

  constructor(
    context: AssignmentContext,
  ) {
    this.assignment = context.assignment;
    this.saveDraft = context.saveDraft;
  }
}
