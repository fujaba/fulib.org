import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ClipboardModule} from 'ngx-clipboard';
import {DragulaModule} from 'ng2-dragula';
import {DndModule} from 'ngx-drag-drop';

import {SharedModule} from '../shared/shared.module';

import {AssignmentRoutingModule} from './assignment-routing.module';

import {EditAssignmentComponent} from './pages/edit-assignment/edit-assignment.component';
import {CreateSolutionComponent} from './pages/create-solution/create-solution.component';
import {MyCoursesComponent} from './pages/my-courses/my-courses.component';
import {SolutionComponent} from './pages/solution/solution.component';
import {TokenModalComponent} from './components/token-modal/token-modal.component';
import {SolutionTableComponent} from './pages/solution-table/solution-table.component';
import {AssignmentInfoComponent} from './components/assignment-info/assignment-info.component';
import {TaskListComponent} from './components/task-list/task-list.component';
import {GradeFormComponent} from './components/grade-form/grade-form.component';
import {CourseComponent} from './pages/course/course.component';
import {CreateCourseComponent} from './pages/create-course/create-course.component';
import {MyAssignmentsComponent} from './pages/my-assignments/my-assignments.component';
import {MySolutionsComponent} from './pages/my-solutions/my-solutions.component';
import {AuthorNameComponent} from './components/author-name/author-name.component';
import {ImportExportComponent} from './components/import-export/import-export.component';
import { EditTaskListComponent } from './components/edit-task-list/edit-task-list.component';
import { TaskColorPipe } from './pipes/task-color.pipe';
import { EditTaskModalComponent } from './pages/edit-task-modal/edit-task-modal.component';

@NgModule({
    declarations: [
        EditAssignmentComponent,
        CreateSolutionComponent,
        SolutionComponent,
        TokenModalComponent,
        SolutionTableComponent,
        AssignmentInfoComponent,
        TaskListComponent,
        GradeFormComponent,
        CourseComponent,
        CreateCourseComponent,
        MyAssignmentsComponent,
        MySolutionsComponent,
        MyCoursesComponent,
        AuthorNameComponent,
        ImportExportComponent,
        EditTaskListComponent,
        TaskColorPipe,
        EditTaskModalComponent,
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
        AssignmentRoutingModule,
    ],
    exports: [
        AssignmentInfoComponent,
    ],
})
export class AssignmentModule {
}
