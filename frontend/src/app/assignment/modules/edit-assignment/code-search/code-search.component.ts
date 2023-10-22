import {Component} from '@angular/core';
import {AssignmentContext} from "../../../services/assignment.context";
import {ClassroomInfo} from "../../../model/assignment";

@Component({
  selector: 'app-code-search',
  templateUrl: './code-search.component.html',
  styleUrls: ['./code-search.component.scss']
})
export class CodeSearchComponent {
  classroom: ClassroomInfo;

  constructor(
    readonly context: AssignmentContext,
  ) {
    this.classroom = this.context.assignment.classroom ||= {};
  }
}
