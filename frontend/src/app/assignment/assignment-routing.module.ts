import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EditAssignmentComponent} from './edit-assignment/edit-assignment.component';
import {CreateSolutionComponent} from './create-solution/create-solution.component';
import {MyCoursesComponent} from './my-courses/my-courses.component';
import {SolutionTableComponent} from './solution-table/solution-table.component';
import {SolutionComponent} from './solution/solution.component';
import {CreateCourseComponent} from './create-course/create-course.component';
import {CourseComponent} from './course/course.component';
import {MyAssignmentsComponent} from './my-assignments/my-assignments.component';
import {MySolutionsComponent} from './my-solutions/my-solutions.component';

const routes: Routes = [
  {path: '', component: MyAssignmentsComponent},
  {path: 'solutions', component: MySolutionsComponent},
  {path: 'courses', component: MyCoursesComponent},
  {path: 'create', component: EditAssignmentComponent},
  {path: ':aid', component: CreateSolutionComponent},
  {path: ':aid/edit', component: EditAssignmentComponent},
  {path: ':aid/solutions', component: SolutionTableComponent},
  {path: ':aid/solutions/:sid', component: SolutionComponent},
  {path: 'courses/create', component: CreateCourseComponent},
  {path: 'courses/:cid', component: CourseComponent},
  {path: 'courses/:cid/assignments/:aid', component: CourseComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssignmentRoutingModule {
}
