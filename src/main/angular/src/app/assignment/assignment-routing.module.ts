import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CreateAssignmentComponent} from './create-assignment/create-assignment.component';
import {SolveComponent} from './solve/solve.component';
import {SolutionListComponent} from './solution-list/solution-list.component';
import {SolutionComponent} from './solution/solution.component';
import {CreateCourseComponent} from './create-course/create-course.component';
import {CourseComponent} from './course/course.component';
import {AssignmentListComponent} from './assignment-list/assignment-list.component';
import {MySolutionListComponent} from './my-solution-list/my-solution-list.component';

const routes: Routes = [
  {path: '', component: AssignmentListComponent},
  {path: 'solutions', component: MySolutionListComponent},
  {path: 'create', component: CreateAssignmentComponent},
  {path: ':aid', component: SolveComponent},
  {path: ':aid/solutions', component: SolutionListComponent},
  {path: ':aid/solutions/:sid', component: SolutionComponent},
  {path: 'courses/create', component: CreateCourseComponent},
  {path: 'courses/:cid', component: CourseComponent},
  {path: 'courses/:cid/assignments/:aid', component: CourseComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssignmentRoutingModule {
}
