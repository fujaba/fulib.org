import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export interface PushEvent {
  created_at: string;
  type: 'PushEvent';
  actor: {
    login: string;
  };
  payload: {
    ref: string;
    commits: {
      sha: string;
      author: { name: string };
      message: string;
      url: string;
    }[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class GithubService {

  constructor(
    private http: HttpClient,
  ) {
  }

  getPushEvents(org: string, repo: string, token: string): Observable<PushEvent[]> {
    return this.http.get<PushEvent[]>(`https://api.github.com/repos/${org}/${repo}/events`, {
      headers: {
        Authorization: `token ${token}`,
      },
    }).pipe(map(events => events
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .filter(e => e.type === 'PushEvent'),
    ));
  }
}
