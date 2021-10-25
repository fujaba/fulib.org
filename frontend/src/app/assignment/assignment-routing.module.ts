import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CourseComponent} from './pages/course/course.component';
import {CreateCourseComponent} from './pages/create-course/create-course.component';
import {CreateSolutionComponent} from './pages/create-solution/create-solution.component';
import {EditAssignmentComponent} from './pages/edit-assignment/edit-assignment.component';
import {EditTaskModalComponent} from './pages/edit-task-modal/edit-task-modal.component';
import {MyAssignmentsComponent} from './pages/my-assignments/my-assignments.component';
import {MyCoursesComponent} from './pages/my-courses/my-courses.component';
import {MySolutionsComponent} from './pages/my-solutions/my-solutions.component';
import {SolutionTableComponent} from './pages/solution-table/solution-table.component';
import {SolutionComponent} from './pages/solution/solution.component';

const routes: Routes = [
  {path: '', component: MyAssignmentsComponent},
  {path: 'solutions', component: MySolutionsComponent},
  {path: 'courses', component: MyCoursesComponent},
  {
    path: 'create',
    component: EditAssignmentComponent,
    children: [
      {path: 'tasks/:task', component: EditTaskModalComponent},
    ],
  },
  {path: ':aid', component: CreateSolutionComponent},
  {
    path: ':aid/edit',
    component: EditAssignmentComponent,
    children: [
      {path: 'tasks/:task', component: EditTaskModalComponent},
    ],
  },
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
