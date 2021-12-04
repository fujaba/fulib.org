import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Params} from '@angular/router';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {Snippet} from '../../model/evaluation';
import {AssignmentService} from '../../services/assignment.service';

interface SelectionDto {
  assignment: string;
  solution: string;
  author: string;
  snippet: Snippet;
}

@Injectable({
  providedIn: 'root',
})
export class SelectionService {
  constructor(
    private assignmentService: AssignmentService,
    private http: HttpClient,
  ) {
  }

  getAll(assignment: string, solution: string, author?: string): Observable<SelectionDto[]> {
    const headers = {};
    const token = this.assignmentService.getToken(assignment);
    token && (headers['Assignment-Token'] = token);
    const params: Params = {};
    author && (params.author = author);
    return this.http.get<SelectionDto[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/selections`, {headers, params});
  }

  stream(assignment: string, solution: string): Observable<SelectionDto> {
    const token = this.assignmentService.getToken(assignment);
    const url = `${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/selections/events?token=${token}`;
    return new Observable<SelectionDto>(observer => {
      const eventSource = new EventSource(url);
      eventSource.addEventListener('message', event => observer.next(JSON.parse(event.data)));
      eventSource.addEventListener('error', error => observer.error(error));
      return () => eventSource.close();
    });
  }
}
