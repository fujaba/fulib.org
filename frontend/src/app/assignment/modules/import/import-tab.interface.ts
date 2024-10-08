import {Observable} from 'rxjs';

export interface ImportTab {
  import(): Observable<string>;
}
