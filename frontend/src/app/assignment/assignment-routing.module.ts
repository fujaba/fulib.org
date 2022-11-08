import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CreateSolutionComponent} from './pages/create-solution/create-solution.component';
import {MySolutionsComponent} from './pages/my-solutions/my-solutions.component';
import {OverviewComponent} from './pages/overview/overview.component';
import {SettingsComponent} from './pages/settings/settings.component';

const routes: Routes = [
  {path: '', component: OverviewComponent, data: {title: 'Assignments'}},
  {path: 'solutions', component: MySolutionsComponent, data: {title: 'My Solutions'}},
  {path: 'settings', component: SettingsComponent, data: {title: 'Settings'}},
  {
    path: 'courses',
    loadChildren: () => import('./modules/course/course.module').then(m => m.CourseModule),
  },
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
