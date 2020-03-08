import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CreateComponent} from './create/create.component';
import {SolveComponent} from './solve/solve.component';
import {SolutionListComponent} from './solution-list/solution-list.component';
import {SolutionComponent} from './solution/solution.component';
import {CreateCourseComponent} from './create-course/create-course.component';
import {CourseComponent} from './course/course.component';
import {AssignmentListComponent} from './assignment-list/assignment-list.component';

const routes: Routes = [
  {path: '', component: AssignmentListComponent},
  {path: 'create', component: CreateComponent},
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
