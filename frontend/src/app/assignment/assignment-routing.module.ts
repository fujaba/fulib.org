import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AssignmentComponent} from './pages/assignment/assignment.component';
import {ShareComponent} from './pages/assignment/share/share.component';
import {SolutionTableComponent} from './pages/assignment/solution-table/solution-table.component';
import {StatisticsComponent} from './pages/assignment/statistics/statistics.component';
import {AssignmentTasksComponent} from './pages/assignment/tasks/tasks.component';
import {CourseComponent} from './pages/course/course.component';
import {CreateCourseComponent} from './pages/create-course/create-course.component';
import {CreateSolutionComponent} from './pages/create-solution/create-solution.component';
import {MyAssignmentsComponent} from './pages/my-assignments/my-assignments.component';
import {MyCoursesComponent} from './pages/my-courses/my-courses.component';
import {MySolutionsComponent} from './pages/my-solutions/my-solutions.component';
import {TokenModalComponent} from './pages/token-modal/token-modal.component';


export const assignmentChildRoutes = [
  {path: 'tasks', component: AssignmentTasksComponent, data: {title: 'Tasks & Sample Solution'}},
  {path: 'share', component: ShareComponent, data: {title: 'Sharing'}},
  {path: 'solutions', component: SolutionTableComponent, data: {title: 'Solutions'}},
  {path: 'statistics', component: StatisticsComponent, data: {title: 'Statistics', new: true}},
  {path: 'token', component: TokenModalComponent},
];


const routes: Routes = [
  {path: '', component: MyAssignmentsComponent},
  {path: 'solutions', component: MySolutionsComponent},
  {path: 'courses', component: MyCoursesComponent},
  {path: 'courses/create', component: CreateCourseComponent},
  {path: 'courses/:cid', component: CourseComponent},
  {path: 'courses/:cid/assignments/:aid', component: CourseComponent},
  {
    path: 'create',
    loadChildren: () => import('./modules/edit-assignment/edit-assignment.module').then(m => m.EditAssignmentModule),
  },
  {path: ':aid/solutions/new', component: CreateSolutionComponent},
  {
    path: ':aid/solutions/:sid',
    loadChildren: () => import('./modules/solution/solution.module').then(s => s.SolutionModule),
  },
  {
    path: ':aid/edit',
    loadChildren: () => import('./modules/edit-assignment/edit-assignment.module').then(m => m.EditAssignmentModule),
  },
  {path: ':aid', pathMatch: 'full', redirectTo: ':aid/solutions/new'},
  {
    path: ':aid',
    component: AssignmentComponent,
    children: assignmentChildRoutes,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssignmentRoutingModule {
}
