import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {CreateTelemetryDto, Telemetry} from '../model/telemetry';

@Injectable()
export class TelemetryService {
  constructor(
    private http: HttpClient,
  ) {
  }

  create(assignment: string, solution: string, dto: CreateTelemetryDto): Observable<Telemetry> {
    return this.http.post<Telemetry>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/telemetry`, dto);
  }
}
