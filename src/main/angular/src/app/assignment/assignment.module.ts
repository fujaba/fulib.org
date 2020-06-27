import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ClipboardModule} from 'ngx-clipboard';
import {DragulaModule} from 'ng2-dragula';

import {SharedModule} from '../shared/shared.module';

import {AssignmentRoutingModule} from './assignment-routing.module';

import {CreateAssignmentComponent} from './create-assignment/create-assignment.component';
import {SolveComponent} from './solve/solve.component';
import {SolutionComponent} from './solution/solution.component';
import {TokenModalComponent} from './token-modal/token-modal.component';
import {SolutionListComponent} from './solution-list/solution-list.component';
import { AssignmentInfoComponent } from './assignment-info/assignment-info.component';
import { TaskListComponent } from './task-list/task-list.component';
import { GradeFormComponent } from './grade-form/grade-form.component';
import { CourseComponent } from './course/course.component';
import { CreateCourseComponent } from './create-course/create-course.component';
import { MyAssignmentsComponent } from './my-assignments/my-assignments.component';
import { MySolutionsComponent } from './my-solutions/my-solutions.component';
import { AuthorNameComponent } from './author-name/author-name.component';
import { ImportExportComponent } from './import-export/import-export.component';

@NgModule({
  declarations: [
    CreateAssignmentComponent,
    SolveComponent,
    SolutionComponent,
    TokenModalComponent,
    SolutionListComponent,
    AssignmentInfoComponent,
    TaskListComponent,
    GradeFormComponent,
    CourseComponent,
    CreateCourseComponent,
    MyAssignmentsComponent,
    MySolutionsComponent,
    AuthorNameComponent,
    ImportExportComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    ClipboardModule,
    DragulaModule.forRoot(),
    AssignmentRoutingModule,
  ]
})
export class AssignmentModule {
}
