import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  NgbAccordionModule,
  NgbDropdownModule,
  NgbNavModule,
  NgbPopoverModule,
  NgbTooltipModule,
  NgbTypeaheadModule,
} from '@ng-bootstrap/ng-bootstrap';
import {ModalModule, RouteTabsModule} from '@mean-stream/ngbx';
import {ClipboardModule} from 'ngx-clipboard';
import {SharedModule} from '../../../shared/shared.module';
import {AssignmentSharedModule} from '../shared/shared.module';

import {AssignmentRoutingModule} from './assignment-routing.module';
import {AssignmentComponent} from './assignment/assignment.component';
import {DeleteModalComponent} from './delete-modal/delete-modal.component';
import {SearchComponent} from './search/search.component';
import {ShareComponent} from './share/share.component';
import {SolutionTableComponent} from './solution-table/solution-table.component';
import {StatisticsBlockComponent} from './statistics-block/statistics-block.component';
import {StatisticsComponent} from './statistics/statistics.component';
import {SubmitModalComponent} from './submit-modal/submit-modal.component';
import {AssignmentTasksComponent} from './tasks/tasks.component';

@NgModule({
  declarations: [
    AssignmentComponent,
    AssignmentTasksComponent,
    SubmitModalComponent,
    ShareComponent,
    SolutionTableComponent,
    StatisticsComponent,
    SearchComponent,
    StatisticsBlockComponent,
    DeleteModalComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ClipboardModule,
    NgbTypeaheadModule,
    NgbPopoverModule,
    NgbTooltipModule,
    AssignmentSharedModule,
    AssignmentRoutingModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbAccordionModule,
    RouteTabsModule,
    ModalModule,
  ],
})
export class AssignmentModule {
}
