import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TokenModalComponent} from '../../pages/token-modal/token-modal.component';
import {assignmentChildRoutes} from './assignment-routes';
import {AssignmentComponent} from './assignment/assignment.component';
import {DeleteModalComponent} from './delete-modal/delete-modal.component';

const routes: Routes = [
  {
    path: '',
    component: AssignmentComponent,
    data: {title: 'Assignment'},
    children: [
      ...assignmentChildRoutes,
      {path: 'token', component: TokenModalComponent, data: {title: 'Authorization Required'}},
      {
        path: 'import',
        loadChildren: () => import('../import/import.module').then(m => m.ImportModule),
      },
      {path: 'delete', component: DeleteModalComponent, data: {title: 'Delete Assignment'}},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssignmentRoutingModule {
}
