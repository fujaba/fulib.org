import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {ModalModule, RouteTabsModule} from '@mean-stream/ngbx';
import {DndModule} from 'ngx-drag-drop';
import {SharedModule} from '../../../shared/shared.module';
import {AssignmentSharedModule} from '../shared/shared.module';
import {ClassroomComponent} from './classroom/classroom.component';

import {EditAssignmentRoutingModule} from './edit-assignment-routing.module';
import {EditAssignmentComponent} from './edit-assignment/edit-assignment.component';
import {EditTaskListComponent} from './edit-task-list/edit-task-list.component';
import {EditTaskModalComponent} from './edit-task-modal/edit-task-modal.component';
import {InfoComponent} from './info/info.component';
import {PreviewComponent} from './preview/preview.component';
import {TasksComponent} from './tasks/tasks.component';
import {TaskMarkdownService} from "./task-markdown.service";
import { CodeSearchComponent } from './code-search/code-search.component';
import { PlagiarismDetectionComponent } from './plagiarism-detection/plagiarism-detection.component';


@NgModule({
  declarations: [
    ClassroomComponent,
    EditAssignmentComponent,
    EditTaskListComponent,
    EditTaskModalComponent,
    InfoComponent,
    PreviewComponent,
    TasksComponent,
    CodeSearchComponent,
    PlagiarismDetectionComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    DndModule,
    AssignmentSharedModule,
    EditAssignmentRoutingModule,
    NgbTooltipModule,
    RouteTabsModule,
    ModalModule,
  ],
  providers: [
    TaskMarkdownService,
  ],
})
export class EditAssignmentModule {
}
