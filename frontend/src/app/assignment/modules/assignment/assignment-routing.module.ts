import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TokenModalComponent} from '../../pages/token-modal/token-modal.component';
import {assignmentChildRoutes} from './assignment-routes';
import {AssignmentComponent} from './assignment/assignment.component';
import {DeleteModalComponent} from './delete-modal/delete-modal.component';
import {ImportModalComponent} from './import-modal/import-modal.component';

const routes: Routes = [
  {
    path: '',
    component: AssignmentComponent,
    data: {title: 'Assignment'},
    children: [
      ...assignmentChildRoutes,
      {path: 'token', component: TokenModalComponent, data: {title: 'Authorization Required'}},
      {path: 'import', component: ImportModalComponent, data: {title: 'Import Solutions'}},
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
