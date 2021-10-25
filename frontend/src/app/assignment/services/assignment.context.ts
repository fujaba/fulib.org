import {Injectable} from '@angular/core';
import Assignment from '../model/assignment';
import {CreateEvaluationDto} from '../model/evaluation';

@Injectable()
export class AssignmentContext {
  assignment: Assignment;
  evaluations?: Record<string, CreateEvaluationDto>;

}
