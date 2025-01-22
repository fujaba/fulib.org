import {Component} from '@angular/core';
import {AssignmentContext} from '../../../services/assignment.context';
import {ClassroomInfo, OpenAIConfig} from '../../../model/assignment';

@Component({
  selector: 'app-code-search',
  templateUrl: './code-search.component.html',
  styleUrls: ['./code-search.component.scss'],
  standalone: false,
})
export class CodeSearchComponent {
  classroom: ClassroomInfo;
  openAI: OpenAIConfig;

  // TODO use a shared constant when frontend and backend are merged
  embeddingModels = [
    {id: 'text-embedding-3-small', label: 'Cheapest', labelBg: 'success'},
    {id: 'text-embedding-3-large', label: 'Most accurate', labelBg: 'primary'},
    {id: 'text-embedding-ada-002', label: 'Legacy', labelBg: 'secondary'},
  ] as const;

  constructor(
    readonly context: AssignmentContext,
  ) {
    this.classroom = this.context.assignment.classroom ||= {};
    this.openAI = this.context.assignment.openAI ||= {};
    this.openAI.consent ??= true;
    this.openAI.model ??= 'text-embedding-ada-002';
  }
}
