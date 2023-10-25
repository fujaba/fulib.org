import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbPopoverModule, NgbTooltipModule, NgbTypeaheadModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule as NgbxFormsModule, ModalModule, RouteTabsModule} from '@mean-stream/ngbx';
import {ClipboardModule} from 'ngx-clipboard';
import {SharedModule} from '../../../shared/shared.module';
import {AssignmentSharedModule} from '../shared/shared.module';

import {CommentListComponent} from './comment-list/comment-list.component';
import {DeleteModalComponent} from './delete-modal/delete-modal.component';
import {SolutionDetailsComponent} from './details/details.component';
import {EditSnippetComponent} from './edit-snippet/edit-snippet.component';
import {EvaluationFormComponent} from './evaluation-form/evaluation-form.component';
import {EvaluationModalComponent} from './evaluation-modal/evaluation-modal.component';
import {SolutionShareComponent} from './share/share.component';
import {SolutionRoutingModule} from './solution-routing.module';
import {SolutionComponent} from './solution/solution.component';
import {SolutionTasksComponent} from './tasks/tasks.component';
import { SimilarModalComponent } from './similar-modal/similar-modal.component';
import {CommentService} from "./comment.service";
import { FeedbackComponent } from './feedback/feedback.component';


@NgModule({
  declarations: [
    CommentListComponent,
    EvaluationModalComponent,
    SolutionComponent,
    SolutionDetailsComponent,
    SolutionShareComponent,
    SolutionTasksComponent,
    EditSnippetComponent,
    EvaluationFormComponent,
    DeleteModalComponent,
    SimilarModalComponent,
    FeedbackComponent,
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
    RouteTabsModule,
    ModalModule,
    NgbPopoverModule,
    NgbxFormsModule,
  ],
  providers: [
    CommentService,
  ],
})
export class SolutionModule {
}
