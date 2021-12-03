import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import Task from '../../model/task';


interface SolutionStatistics {
  evaluated: {
    codeSearch: number;
    manual: number;
    total: number;
  };
  graded: number;
  pointsAvg: number;
  total: number;
}

interface EvaluationStatistics {
  codeSearch: number;
  manual: number;
  total: number;
}

interface TaskStatistics {
  task: string;
  totalPoints: number;
  totalCount: number;

  resolved: Task[];
}

export interface AssignmentStatistics {
  solutions: SolutionStatistics;
  evaluations: EvaluationStatistics;
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
