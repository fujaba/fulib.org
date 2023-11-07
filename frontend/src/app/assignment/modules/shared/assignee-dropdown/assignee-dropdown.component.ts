import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AssigneeService} from "../../../services/assignee.service";
import {ToastService} from "@mean-stream/ngbx";

@Component({
  selector: 'app-assignee-dropdown',
  templateUrl: './assignee-dropdown.component.html',
  styleUrls: ['./assignee-dropdown.component.scss']
})
export class AssigneeDropdownComponent {
  @Input({required: true}) assignment: string;
  @Input({required: true}) solution: string;
  @Input() assignee?: string;
  @Input() assignees: string[] = [];

  @Output() assigneeChange = new EventEmitter<string | undefined>();

  constructor(
    private assigneeService: AssigneeService,
    private toastService: ToastService,
  ) {
  }

  save(): void {
    this.assigneeService.setAssignee(this.assignment, this.solution, this.assignee).subscribe(result => {
      this.assigneeChange.next(result?.assignee);
      this.toastService.success('Assignee', result ? `Successfully assigned to ${result.assignee}` : 'Successfully de-assigned');
    }, error => {
      this.toastService.error('Assignee', 'Failed to assign', error);
    });
  }
}
