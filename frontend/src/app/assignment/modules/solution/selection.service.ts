import {Injectable, NgZone} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {Snippet} from '../../model/evaluation';

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
    private zone: NgZone,
  ) {
  }

  stream(assignment: string, solution: string): Observable<SelectionDto> {
    return new Observable<SelectionDto>(observer => {
      let url = `${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/selections`;
      const eventSource = new EventSource(url);
      eventSource.onmessage = x => this.zone.run(() => observer.next(JSON.parse(x.data)));
      eventSource.onerror = x => this.zone.run(() => observer.error(x));
      return () => eventSource.close();
    });
  }
}
