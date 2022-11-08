import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CreateSolutionComponent} from '../../pages/create-solution/create-solution.component';
import {CreateCourseSolutionsComponent} from './create-course-solutions/create-course-solutions.component';
import {CreateCourseComponent} from './create-course/create-course.component';
import {MyCoursesComponent} from './my-courses/my-courses.component';

const routes: Routes = [
  {path: 'create', component: CreateCourseComponent, data: {title: 'Create Course'}},
  {
    path: ':cid',
    component: CreateCourseSolutionsComponent,
    data: {title: 'Course'},
    children: [
      {path: 'assignments/:aid', component: CreateSolutionComponent},
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
