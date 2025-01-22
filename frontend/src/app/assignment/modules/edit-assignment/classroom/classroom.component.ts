import {Component} from '@angular/core';
import {ClassroomInfo} from '../../../model/assignment';
import {AssignmentContext} from '../../../services/assignment.context';

@Component({
  selector: 'app-edit-assignment-classroom',
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.scss'],
  standalone: false,
})
export class ClassroomComponent {
  classroom: ClassroomInfo;

  encodeURIComponent = encodeURIComponent;

  constructor(
    readonly context: AssignmentContext,
  ) {
    this.classroom = context.assignment.classroom ||= {};
  }

  previewSearch() {
    const url = new URL(`https://github.com/search`);
    url.searchParams.set('type', 'repositories');
    url.searchParams.set('q', `org:${this.classroom.org} "${this.classroom.prefix}-" in:name ${this.classroom.extraSearch ?? 'fork:true'}`);
    open(url);
  }
}
