import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Observable, OperatorFunction} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, switchMap} from 'rxjs/operators';
import {User} from '../user';
import {UserService} from '../user.service';

@Component({
  selector: 'app-user-typeahead',
  templateUrl: './user-typeahead.component.html',
  styleUrls: ['./user-typeahead.component.scss'],
  standalone: false,
})
export class UserTypeaheadComponent {
  @Input() label: string;

  @Input() user?: User;
  @Output() userChange = new EventEmitter<User>();

  search: OperatorFunction<string, User[]> = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    filter(term => term.length >= 2),
    switchMap(term => this.userService.findAll(term)),
  );

  formatter = (user: User) => `${user.firstName} ${user.lastName} (${user.username})`;

  constructor(
    private userService: UserService,
  ) {
  }
}
