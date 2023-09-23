import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import Task from '../../model/task';
import {AssignmentService} from '../../services/assignment.service';


export interface SolutionStatistics {
  evaluated: number;
  graded: number;
  passed: number;
  pointsAvg: number;
  total: number;
}

export interface EvaluationStatistics {
  codeSearch: number;
  editedCodeSearch: number;
  manual: number;
  total: number;
}

export interface TaskStatistics {
  task: string;
  points: EvaluationStatistics;
  count: EvaluationStatistics;
  timeAvg: number;

  _tasks: Task[];
  _task: Task;
  _score: number;
  _pointsAvg: number;
  _codeSearchEffectiveness: number;
  _codeSearchTimeSavings: number;
}

export interface TimeStatistics {
  evaluationTotal: number;
  evaluationAvg: number;
  pointsAvg: number;
  codeSearchSavings: number;
}

export interface AssignmentStatistics {
  solutions: SolutionStatistics;
  evaluations: EvaluationStatistics;
  weightedEvaluations: EvaluationStatistics;
  time: TimeStatistics;
  comments: number;
  tasks: TaskStatistics[];
}

@Injectable()
export class StatisticsService {
  constructor(
    private http: HttpClient,
    private assignmentService: AssignmentService,
  ) {
  }

  getAssignmentStatistics(assignment: string): Observable<AssignmentStatistics> {
    const token = this.assignmentService.getToken(assignment);
    const headers: Record<string, string> = token ? {'Assignment-Token': token} : {};
    return this.http.get<AssignmentStatistics>(`${environment.assignmentsApiUrl}/assignments/${assignment}/statistics`, {headers});
  }
}
