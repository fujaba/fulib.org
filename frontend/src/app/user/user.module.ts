import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbTypeaheadModule} from '@ng-bootstrap/ng-bootstrap';
import {UserTypeaheadComponent} from './user-typeahead/user-typeahead.component';


@NgModule({
  declarations: [UserTypeaheadComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbTypeaheadModule,
  ],
  exports: [
    UserTypeaheadComponent,
  ],
})
export class UserModule {
}
