import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {DateValueAccessorModule} from 'angular-date-value-accessor';
import {ClipboardModule} from 'ngx-clipboard';

import {SharedModule} from '../shared/shared.module';

import {AssignmentRoutingModule} from './assignment-routing.module';

import {CreateComponent} from './create/create.component';
import {SolveComponent} from './solve/solve.component';
import {SolutionComponent} from './solution/solution.component';
import {TokenModalComponent} from './token-modal/token-modal.component';
import {SolutionListComponent} from './solution-list/solution-list.component';
import { GradeModalComponent } from './grade-modal/grade-modal.component';

@NgModule({
  declarations: [
    CreateComponent,
    SolveComponent,
    SolutionComponent,
    TokenModalComponent,
    SolutionListComponent,
    GradeModalComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    DateValueAccessorModule,
    ClipboardModule,
    AssignmentRoutingModule,
  ]
})
export class AssignmentModule {
}
