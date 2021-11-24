import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbPopoverModule, NgbTooltipModule, NgbTypeaheadModule} from '@ng-bootstrap/ng-bootstrap';
import {ClipboardModule} from 'ngx-clipboard';
import {SharedModule} from '../../../shared/shared.module';
import {AssignmentSharedModule} from '../shared/shared.module';

import {AssignmentRoutingModule} from './assignment-routing.module';
import {AssignmentComponent} from './assignment/assignment.component';
import {SubmitModalComponent} from './submit-modal/submit-modal.component';
import {ShareComponent} from './share/share.component';
import {SolutionTableComponent} from './solution-table/solution-table.component';
import {StatisticsComponent} from './statistics/statistics.component';
import {AssignmentTasksComponent} from './tasks/tasks.component';
import { SearchComponent } from './search/search.component';


@NgModule({
  declarations: [
    AssignmentComponent,
    AssignmentTasksComponent,
    SubmitModalComponent,
    ShareComponent,
    SolutionTableComponent,
    StatisticsComponent,
    SearchComponent,
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
  ],
})
export class AssignmentModule {
}
