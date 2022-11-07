import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {KeycloakService} from 'keycloak-angular';
import {BehaviorSubject, Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {User} from './user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _current = new BehaviorSubject<User | null>(null);

  constructor(
    private keycloak: KeycloakService,
    private http: HttpClient,
  ) {
    this.init();
  }

  get current$(): Observable<User | null> {
    return this._current;
  }

  findAll(search?: string): Observable<User[]> {
    return this.http.get<User[]>(`${environment.auth.url}/admin/realms/${environment.auth.realm}/users`, {
      params: {
        ...(search ? {search} : {}),
        briefRepresentation: 'true',
      },
    });
  }

  findOne(id: string): Observable<User> {
    return this.http.get<User>(`${environment.auth.url}/admin/realms/${environment.auth.realm}/users/${id}`);
  }

  getGitHubToken(): Observable<string | undefined> {
    const paramName = 'access_token=';
    return this.http.get(`${environment.auth.url}/realms/${environment.auth.realm}/broker/github/token`, {
      responseType: 'text',
    }).pipe(
      catchError(() => ''),
      map(data => data.split('&').filter(s => s.startsWith(paramName))[0]?.substring(paramName.length)),
    );
  }

  private init(): void {
    this.reload();
    this.keycloak.keycloakEvents$.subscribe(event => {
      this.reload();
    });
  }

  private reload(): void {
    this.keycloak.isLoggedIn().then(loggedIn => {
      if (!loggedIn) {
        this._current.next(null);
        return;
      }
      this.keycloak.loadUserProfile().then(profile => {
        const user: User = {
          id: this.keycloak.getKeycloakInstance().subject,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
        };
        this._current.next(user);
      });
    });
  }
}
