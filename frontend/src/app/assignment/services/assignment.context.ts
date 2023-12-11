import {Injectable} from '@angular/core';
import Assignment, {CreateAssignmentDto} from '../model/assignment';
import Task from "../model/task";

@Injectable()
export class AssignmentContext {
  assignment: Assignment | CreateAssignmentDto;
  saveDraft: () => void;

  getAssignment(): Assignment | CreateAssignmentDto {
    return {
      ...this.assignment,
      tasks: this.getTasks(this.assignment.tasks),
    };
  }

  private getTasks(tasks: Task[]): Task[] {
    return tasks.filter(t => !t.deleted).map(({deleted, collapsed, children, ...rest}) => ({
      ...rest,
      children: this.getTasks(children),
    }));
  }
}
