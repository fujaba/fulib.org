import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {BarChartModule} from '@swimlane/ngx-charts';
import {DragulaModule} from 'ng2-dragula';
import {ClipboardModule} from 'ngx-clipboard';
import {DndModule} from 'ngx-drag-drop';

import {SharedModule} from '../shared/shared.module';
import {AssignmentRoutingModule} from './assignment-routing.module';

import {AssignmentSharedModule} from './modules/shared/shared.module';

import {AssignmentComponent} from './pages/assignment/assignment.component';
import {ShareComponent} from './pages/assignment/share/share.component';
import {SolutionTableComponent} from './pages/assignment/solution-table/solution-table.component';
import {StatisticsComponent} from './pages/assignment/statistics/statistics.component';
import {AssignmentTasksComponent} from './pages/assignment/tasks/tasks.component';
import {CourseComponent} from './pages/course/course.component';
import {CreateCourseComponent} from './pages/create-course/create-course.component';
import {CreateSolutionComponent} from './pages/create-solution/create-solution.component';
import {MyAssignmentsComponent} from './pages/my-assignments/my-assignments.component';
import {MyCoursesComponent} from './pages/my-courses/my-courses.component';
import {MySolutionsComponent} from './pages/my-solutions/my-solutions.component';
import {TokenModalComponent} from './pages/token-modal/token-modal.component';

@NgModule({
  declarations: [
    AssignmentComponent,
    AssignmentTasksComponent,
    CourseComponent,
    CreateCourseComponent,
    CreateSolutionComponent,
    MyAssignmentsComponent,
    MyCoursesComponent,
    MySolutionsComponent,
    ShareComponent,
    SolutionTableComponent,
    StatisticsComponent,
    TokenModalComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    ClipboardModule,
    DragulaModule,
    AssignmentSharedModule,
    AssignmentRoutingModule,
    BarChartModule,
  ],
})
export class AssignmentModule {
}
