import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {UserService} from '../../../../user/user.service';
import Assignment from '../../../model/assignment';
import {AssignmentContext} from '../../../services/assignment.context';

@Component({
  selector: 'app-edit-assignment-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent implements OnInit, OnDestroy {
  assignment: Assignment;

  deadlineDate?: string;
  deadlineTime?: string;

  private userSubscription: Subscription;

  constructor(
    private context: AssignmentContext,
  ) {
    this.assignment = context.assignment;
  }

  ngOnInit(): void {
    if (this.assignment.deadline) {
      const deadline = new Date(this.assignment.deadline);
      const year = deadline.getFullYear();
      const month = String(deadline.getMonth() + 1).padStart(2, '0');
      const day = String(deadline.getDate()).padStart(2, '0');
      this.deadlineDate = `${year}-${month}-${day}`;

      const hour = String(deadline.getHours()).padStart(2, '0');
      const minute = String(deadline.getMinutes()).padStart(2, '0');
      const second = String(deadline.getSeconds()).padStart(2, '0');
      this.deadlineTime = `${hour}:${minute}:${second}`;
    } else {
      this.deadlineDate = undefined;
      this.deadlineTime = undefined;
    }
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  saveDraft(): void {
    this.assignment.deadline = this.getDeadline();
    this.context.saveDraft();
  }

  getDeadline(): Date | undefined {
    return this.deadlineDate ? new Date(this.deadlineDate + ' ' + (this.deadlineTime ?? '00:00')) : undefined;
  }
}
