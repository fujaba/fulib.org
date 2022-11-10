import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CreateSolutionComponent} from '../../pages/create-solution/create-solution.component';
import {CourseComponent} from './course/course.component';
import {CreateCourseSolutionsComponent} from './create-course-solutions/create-course-solutions.component';
import {CreateCourseComponent} from './create-course/create-course.component';
import {MyCoursesComponent} from './my-courses/my-courses.component';
import {ShareComponent} from './share/share.component';
import {StudentsComponent} from './students/students.component';

export const courseChildren = [
  {path: 'share', component: ShareComponent, data: {title: 'Share'}},
  {path: 'students', component: StudentsComponent, data: {title: 'Students'}},
];
const routes: Routes = [
  {path: 'create', component: CreateCourseComponent, data: {title: 'Create Course'}},
  {path: ':cid/edit', component: CreateCourseComponent, data: {title: 'Edit Course'}},
  {path: ':cid', pathMatch: 'full', redirectTo: ':cid/assignments'},
  {
    path: ':cid',
    data: {title: 'Course'},
    component: CourseComponent,
    children: courseChildren,
  },
  {
    path: ':cid/assignments',
    component: CreateCourseSolutionsComponent,
    data: {title: 'Course'},
    children: [
      {path: ':aid', component: CreateSolutionComponent},
    ],
  },
  {path: '', component: MyCoursesComponent, data: {title: 'My Courses'}},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CourseRoutingModule {
}
