import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {User} from "./user";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  readonly current$: Observable<User | null>;

  constructor() {
  }
}
