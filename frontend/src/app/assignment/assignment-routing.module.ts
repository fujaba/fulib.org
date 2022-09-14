import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {CourseComponent} from './pages/course/course.component';
import {CreateCourseComponent} from './pages/create-course/create-course.component';
import {CreateSolutionComponent} from './pages/create-solution/create-solution.component';
import {OverviewComponent} from './pages/overview/overview.component';
import {SettingsComponent} from './pages/settings/settings.component';

const routes: Routes = [
  {path: '', component: OverviewComponent, data: {title: 'Assignments'}},
  {path: 'solutions', redirectTo: ''},
  {path: 'settings', component: SettingsComponent, data: {title: 'Settings'}},
  {path: 'courses/create', component: CreateCourseComponent, data: {title: 'Create Course'}},
  {path: 'courses/:cid', component: CourseComponent, data: {title: 'Course'}},
  {path: 'courses/:cid/assignments/:aid', component: CourseComponent, data: {title: 'Course'}},
  {path: 'courses', redirectTo: ''},
  {
    path: 'create',
    loadChildren: () => import('./modules/edit-assignment/edit-assignment.module').then(m => m.EditAssignmentModule),
  },
  {path: ':aid/solutions/new', component: CreateSolutionComponent, data: {title: 'New Solution'}},
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
    loadChildren: () => import('./modules/assignment/assignment.module').then(m => m.AssignmentModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssignmentRoutingModule {
}
