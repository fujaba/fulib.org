import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {User} from './user';
import {KeycloakService} from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
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
