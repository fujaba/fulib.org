import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {BarChartModule} from '@swimlane/ngx-charts';
import {DragulaModule} from 'ng2-dragula';
import {ClipboardModule} from 'ngx-clipboard';

import {SharedModule} from '../shared/shared.module';
import {AssignmentRoutingModule} from './assignment-routing.module';
import {AssignmentSharedModule} from './modules/shared/shared.module';

import {CourseComponent} from './pages/course/course.component';
import {CreateCourseComponent} from './pages/create-course/create-course.component';
import {CreateSolutionComponent} from './pages/create-solution/create-solution.component';
import {MyAssignmentsComponent} from './pages/my-assignments/my-assignments.component';
import {MyCoursesComponent} from './pages/my-courses/my-courses.component';
import {MySolutionsComponent} from './pages/my-solutions/my-solutions.component';
import {TokenModalComponent} from './pages/token-modal/token-modal.component';
import {ConfigService} from './services/config.service';

@NgModule({
  declarations: [
    CourseComponent,
    CreateCourseComponent,
    CreateSolutionComponent,
    MyAssignmentsComponent,
    MyCoursesComponent,
    MySolutionsComponent,
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
  ],
  providers: [
    ConfigService,
  ],
})
export class AssignmentModule {
}
