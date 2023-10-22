import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbTooltip, NgbTypeaheadModule} from '@ng-bootstrap/ng-bootstrap';
import {UserTypeaheadComponent} from './user-typeahead/user-typeahead.component';
import { MemberListComponent } from './member-list/member-list.component';


@NgModule({
  declarations: [UserTypeaheadComponent, MemberListComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbTypeaheadModule,
    NgbTooltip,
  ],
  exports: [
    UserTypeaheadComponent,
    MemberListComponent,
  ],
})
export class UserModule {
}
