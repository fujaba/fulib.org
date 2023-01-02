import {Injectable} from '@angular/core';
import Assignment, {CreateAssignmentDto} from '../model/assignment';
import {CreateEvaluationDto, Evaluation} from '../model/evaluation';

@Injectable()
export class AssignmentContext {
  assignment: Assignment | CreateAssignmentDto;
  evaluations?: Record<string, Evaluation | CreateEvaluationDto>;
  saveDraft: () => void;
}
