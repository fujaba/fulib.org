import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import Task from '../../model/task';


interface SolutionStatistics {
  evaluated: number;
  graded: number;
  pointsAvg: number;
  total: number;
}

export interface EvaluationStatistics {
  codeSearch: number;
  editedCodeSearch: number;
  manual: number;
  total: number;
}

interface TaskStatistics {
  task: string;
  points: EvaluationStatistics
  count: EvaluationStatistics;
  timeAvg: number;

  _tasks: Task[];
  _task: Task;
  _score: number;
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
  tasks: TaskStatistics[];
}

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  constructor(
    private http: HttpClient,
  ) {
  }

  getAssignmentStatistics(assignment: string): Observable<AssignmentStatistics> {
    return this.http.get<AssignmentStatistics>(`${environment.assignmentsApiUrl}/assignments/${assignment}/statistics`);
  }
}
