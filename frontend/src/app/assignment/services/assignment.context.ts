import {Injectable} from '@angular/core';
import Assignment, {CreateAssignmentDto} from '../model/assignment';

@Injectable()
export class AssignmentContext {
  assignment: Assignment | CreateAssignmentDto;
  saveDraft: () => void;
}
