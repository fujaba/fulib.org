import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbDropdownModule, NgbTooltipModule, NgbTypeaheadModule} from '@ng-bootstrap/ng-bootstrap';
import {RouteTabsModule} from '@mean-stream/ngbx';
import {ClipboardModule} from 'ngx-clipboard';
import {DndModule} from 'ngx-drag-drop';
import {SharedModule} from '../../../shared/shared.module';
import {AssignmentSharedModule} from '../shared/shared.module';

import {CourseRoutingModule} from './course-routing.module';
import {CreateCourseSolutionsComponent} from './create-course-solutions/create-course-solutions.component';
import {CreateCourseComponent} from './create-course/create-course.component';
import {MyCoursesComponent} from './my-courses/my-courses.component';
import {CourseComponent} from './course/course.component';
import {ShareComponent} from './share/share.component';
import {StudentsComponent} from './students/students.component';
import {AssigneesComponent} from "./assignees/assignees.component";


@NgModule({
  declarations: [
    CreateCourseSolutionsComponent,
    CreateCourseComponent,
    MyCoursesComponent,
    CourseComponent,
    ShareComponent,
    StudentsComponent,
    AssigneesComponent,
  ],
  imports: [
    CommonModule,
    CourseRoutingModule,
    SharedModule,
    AssignmentSharedModule,
    FormsModule,
    NgbTypeaheadModule,
    DndModule,
    ClipboardModule,
    NgbTooltipModule,
    RouteTabsModule,
    NgbDropdownModule,
  ],
})
export class CourseModule {
}
