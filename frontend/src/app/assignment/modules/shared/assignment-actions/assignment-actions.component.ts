import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ToastService} from 'ng-bootstrap-ext';
import {ReadAssignmentDto} from '../../../model/assignment';
import {AssignmentService} from '../../../services/assignment.service';

@Component({
  selector: 'app-assignment-actions',
  templateUrl: './assignment-actions.component.html',
  styleUrls: ['./assignment-actions.component.scss'],
})
export class AssignmentActionsComponent {
  @Input() assignment: ReadAssignmentDto;
  @Output() removed = new EventEmitter<void>();

  constructor(
    private assignmentService: AssignmentService,
    private toastService: ToastService,
  ) {
  }

  archive() {
    const {_id, archived} = this.assignment;
    this.assignmentService.update(_id, {
      archived: !archived,
    }).subscribe(result => {
      this.assignment.archived = result.archived;
      this.removed.next();
      this.toastService.warn('Archive Assignment', `Successfully ${archived ? 'un' : ''}archived assignment`);
    }, error => {
      this.toastService.error('Archive Assignment', `Failed to ${archived ? 'un' : ''}archive assignment`, error);
    });
  }
}
