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
  embeddingModels = [
    {id: 'text-embedding-3-small', label: 'Cheapest', labelBg: 'success'},
    {id: 'text-embedding-3-large', label: 'Most accurate', labelBg: 'primary'},
    {id: 'text-embedding-ada-002', label: 'Legacy', labelBg: 'secondary'},
  ] as const;

  constructor(
    readonly context: AssignmentContext,
  ) {
    this.classroom = this.context.assignment.classroom ||= {};
    this.classroom.openaiConsent ??= true;
    this.classroom.openaiModel ??= 'text-embedding-ada-002';
  }
}
