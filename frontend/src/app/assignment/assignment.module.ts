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

import {AssignmentInfoComponent} from './components/assignment-info/assignment-info.component';
import {AuthorNameComponent} from './components/author-name/author-name.component';
import {CommentListComponent} from './components/comment-list/comment-list.component';
import {EditTaskListComponent} from './components/edit-task-list/edit-task-list.component';
import {ImportExportComponent} from './components/import-export/import-export.component';
import {TaskListComponent} from './components/task-list/task-list.component';

import {AssignmentComponent} from './pages/assignment/assignment.component';
import {ShareComponent} from './pages/assignment/share/share.component';
import {SolutionTableComponent} from './pages/assignment/solution-table/solution-table.component';
import {StatisticsComponent} from './pages/assignment/statistics/statistics.component';
import {AssignmentTasksComponent} from './pages/assignment/tasks/tasks.component';
import {CourseComponent} from './pages/course/course.component';
import {CreateCourseComponent} from './pages/create-course/create-course.component';
import {CreateSolutionComponent} from './pages/create-solution/create-solution.component';
import {ClassroomComponent} from './pages/edit-assignment/classroom/classroom.component';
import {EditAssignmentComponent} from './pages/edit-assignment/edit-assignment.component';
import {InfoComponent} from './pages/edit-assignment/info/info.component';
import {PreviewComponent} from './pages/edit-assignment/preview/preview.component';
import {SampleComponent} from './pages/edit-assignment/sample/sample.component';
import {TasksComponent} from './pages/edit-assignment/tasks/tasks.component';
import {TemplateComponent} from './pages/edit-assignment/template/template.component';
import {EditTaskModalComponent} from './pages/edit-task-modal/edit-task-modal.component';
import {EvaluationModalComponent} from './pages/evaluation-modal/evaluation-modal.component';
import {MyAssignmentsComponent} from './pages/my-assignments/my-assignments.component';
import {MyCoursesComponent} from './pages/my-courses/my-courses.component';
import {MySolutionsComponent} from './pages/my-solutions/my-solutions.component';
import {SolutionDetailsComponent} from './pages/solution/info/details.component';
import {SolutionShareComponent} from './pages/solution/share/share.component';
import {SolutionComponent} from './pages/solution/solution.component';
import {SolutionTasksComponent} from './pages/solution/tasks/tasks.component';
import {TokenModalComponent} from './pages/token-modal/token-modal.component';

@NgModule({
  declarations: [
    AssignmentComponent,
    AssignmentInfoComponent,
    AssignmentTasksComponent,
    ClassroomComponent,
    CommentListComponent,
    CourseComponent,
    CreateCourseComponent,
    CreateSolutionComponent,
    EditAssignmentComponent,
    EditTaskListComponent,
    EditTaskModalComponent,
    EvaluationModalComponent,
    ImportExportComponent,
    InfoComponent,
    MyAssignmentsComponent,
    MyCoursesComponent,
    MySolutionsComponent,
    PreviewComponent,
    SampleComponent,
    ShareComponent,
    SolutionComponent,
    SolutionDetailsComponent,
    SolutionShareComponent,
    SolutionTableComponent,
    SolutionTasksComponent,
    StatisticsComponent,
    TasksComponent,
    TemplateComponent,
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
    DndModule,
    AssignmentSharedModule,
    AssignmentRoutingModule,
    BarChartModule,
  ],
})
export class AssignmentModule {
}
