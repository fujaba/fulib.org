import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbTooltipModule, NgbTypeaheadModule} from '@ng-bootstrap/ng-bootstrap';
import {ClipboardModule} from 'ngx-clipboard';
import {SharedModule} from '../../../shared/shared.module';
import {AssignmentSharedModule} from '../shared/shared.module';

import {CommentListComponent} from './comment-list/comment-list.component';
import {SolutionDetailsComponent} from './details/details.component';
import {EvaluationModalComponent} from './evaluation-modal/evaluation-modal.component';
import {SolutionShareComponent} from './share/share.component';
import {SolutionRoutingModule} from './solution-routing.module';
import {SolutionComponent} from './solution/solution.component';
import {SolutionTasksComponent} from './tasks/tasks.component';


@NgModule({
  declarations: [
    CommentListComponent,
    EvaluationModalComponent,
    SolutionComponent,
    SolutionDetailsComponent,
    SolutionShareComponent,
    SolutionTasksComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NgbTooltipModule,
    ClipboardModule,
    SolutionRoutingModule,
    AssignmentSharedModule,
    NgbTypeaheadModule,
  ],
})
export class SolutionModule {
}
