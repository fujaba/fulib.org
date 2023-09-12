import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbPopoverModule, NgbTooltipModule, NgbTypeaheadModule} from '@ng-bootstrap/ng-bootstrap';
import {ModalModule, RouteTabsModule} from '@mean-stream/ngbx';
import {ClipboardModule} from 'ngx-clipboard';
import {SharedModule} from '../../../shared/shared.module';
import {AssignmentSharedModule} from '../shared/shared.module';

import {CommentListComponent} from './comment-list/comment-list.component';
import {DeleteModalComponent} from './delete-modal/delete-modal.component';
import {SolutionDetailsComponent} from './details/details.component';
import {EditSnippetComponent} from './edit-snippet/edit-snippet.component';
import {EvaluationFormComponent} from './evaluation-form/evaluation-form.component';
import {EvaluationModalComponent} from './evaluation-modal/evaluation-modal.component';
import {EventListComponent} from './event-list/event-list.component';
import {SolutionShareComponent} from './share/share.component';
import {SolutionRoutingModule} from './solution-routing.module';
import {SolutionComponent} from './solution/solution.component';
import {SolutionTasksComponent} from './tasks/tasks.component';
import { SimilarModalComponent } from './similar-modal/similar-modal.component';


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
    EventListComponent,
    SimilarModalComponent,
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
  ],
})
export class SolutionModule {
}
