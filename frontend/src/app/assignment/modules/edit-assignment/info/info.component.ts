import {Component, OnInit} from '@angular/core';
import {CreateAssignmentDto} from '../../../model/assignment';
import {AssignmentContext} from '../../../services/assignment.context';

@Component({
  selector: 'app-edit-assignment-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent implements OnInit {
  assignment: CreateAssignmentDto;

  issuanceDate?: string;
  issuanceTime?: string;
  deadlineDate?: string;
  deadlineTime?: string;

  constructor(
    private context: AssignmentContext,
  ) {
    this.assignment = context.assignment;
  }

  ngOnInit(): void {
    [this.issuanceDate, this.issuanceTime] = getDateAndTime(this.assignment.issuance);
    [this.deadlineDate, this.deadlineTime] = getDateAndTime(this.assignment.deadline);
  }

  saveDraft(): void {
    this.assignment.issuance = makeDate(this.issuanceDate, this.issuanceTime);
    this.assignment.deadline = makeDate(this.deadlineDate, this.deadlineTime);
    this.context.saveDraft();
  }
}

function getTime(deadline: Date): string {
  const hour = String(deadline.getHours()).padStart(2, '0');
  const minute = String(deadline.getMinutes()).padStart(2, '0');
  const second = String(deadline.getSeconds()).padStart(2, '0');
  return `${hour}:${minute}:${second}`;
}

function getDate(deadline: Date): string {
  const year = deadline.getFullYear();
  const month = String(deadline.getMonth() + 1).padStart(2, '0');
  const day = String(deadline.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateAndTime(deadline: Date | string | undefined): [string, string] | [undefined, undefined] {
  if (!deadline) {
    return [undefined, undefined];
  }
  const date = new Date(deadline);
  return [getDate(date), getTime(date)];
}

function makeDate(date: string | undefined, time: string | undefined): Date | undefined {
  return date ? new Date(`${date} ${time || '00:00:00'}`) : undefined;
}
