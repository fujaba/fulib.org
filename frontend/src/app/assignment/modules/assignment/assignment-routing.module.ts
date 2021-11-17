import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TokenModalComponent} from '../../pages/token-modal/token-modal.component';
import {AssignmentComponent} from './assignment/assignment.component';
import {ShareComponent} from './share/share.component';
import {SolutionTableComponent} from './solution-table/solution-table.component';
import {StatisticsComponent} from './statistics/statistics.component';
import {AssignmentTasksComponent} from './tasks/tasks.component';

export const assignmentChildRoutes = [
  {path: 'tasks', component: AssignmentTasksComponent, data: {title: 'Tasks & Sample Solution'}},
  {path: 'share', component: ShareComponent, data: {title: 'Sharing'}},
  {path: 'solutions', component: SolutionTableComponent, data: {title: 'Solutions'}},
  {path: 'statistics', component: StatisticsComponent, data: {title: 'Statistics', new: true}},
];

const routes: Routes = [
  {
    path: '',
    component: AssignmentComponent,
    children: [
      ...assignmentChildRoutes,
      {path: 'token', component: TokenModalComponent},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssignmentRoutingModule {
}
