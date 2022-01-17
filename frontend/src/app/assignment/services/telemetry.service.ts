import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {CreateTelemetryDto, Telemetry} from '../model/telemetry';
import {AssignmentService} from './assignment.service';

@Injectable({
  providedIn: 'root',
})
export class TelemetryService {
  constructor(
    private http: HttpClient,
    private assignmentService: AssignmentService,
  ) {
  }

  create(assignment: string, solution: string, dto: CreateTelemetryDto): Observable<Telemetry> {
    const token = this.assignmentService.getToken(assignment);
    const headers: Record<string, string> = token ? {'Assignment-Token': token} : {};
    return this.http.post<Telemetry>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/telemetry`, dto, {headers});
  }
}
