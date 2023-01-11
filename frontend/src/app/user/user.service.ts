import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {KeycloakService} from 'keycloak-angular';
import {Observable, of, throwError} from 'rxjs';
import {fromPromise} from 'rxjs/internal/observable/innerFrom';
import {catchError, map, startWith, switchMap, tap} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {User} from './user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private keycloak: KeycloakService,
    private http: HttpClient,
  ) {
  }

  getCurrent$(): Observable<User | null> {
    return this.keycloak.keycloakEvents$.pipe(
      tap(console.log),
      startWith(null),
      switchMap(() => this.getCurrent()),
    );
  }

  getCurrent(): Observable<User | null> {
    return fromPromise(this.getCurrentAsync());
  }

  async getCurrentAsync(): Promise<User | null> {
    const loggedIn = await this.keycloak.isLoggedIn();
    if (!loggedIn) {
      return null;
    }
    const profile = await this.keycloak.loadUserProfile();
    return {
      id: this.keycloak.getKeycloakInstance().subject,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
    };
  }

  findAll(search?: string): Observable<User[]> {
    return environment.auth ? this.http.get<User[]>(`${environment.auth.url}/admin/realms/${environment.auth.realm}/users`, {
      params: {
        ...(search ? {search} : {}),
        briefRepresentation: 'true',
      },
    }) : of([]);
  }

  findOne(id: string): Observable<User> {
    return environment.auth ? this.http.get<User>(`${environment.auth.url}/admin/realms/${environment.auth.realm}/users/${id}`) : throwError(() => new Error('No auth server configured'));
  }

  getGitHubToken(): Observable<string | undefined> {
    const paramName = 'access_token=';
    if (!environment.auth) {
      return of(undefined);
    }
    return this.http.get(`${environment.auth.url}/realms/${environment.auth.realm}/broker/github/token`, {
      responseType: 'text',
    }).pipe(
      catchError(() => ''),
      map(data => data.split('&').filter(s => s.startsWith(paramName))[0]?.substring(paramName.length)),
    );
  }
}
