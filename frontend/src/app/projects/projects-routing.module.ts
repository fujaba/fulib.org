import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DeleteModalComponent} from './delete-modal/delete-modal.component';
import {EditModalComponent} from './edit-modal/edit-modal.component';
import {ProjectListComponent} from './project-list/project-list.component';
import {ProjectWorkspaceComponent} from './project-workspace/project-workspace.component';
import {SetupComponent} from './setup/setup/setup.component';
import {TransferComponent} from './transfer/transfer.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectListComponent,
    children: [
      {path: 'edit/:id', component: EditModalComponent},
      {path: 'transfer/:id', component: TransferComponent, data: {back: '../..'}},
      {path: 'delete/:id', component: DeleteModalComponent, data: {back: '../..'}},
    ],
  },
  {
    path: ':id',
    component: ProjectWorkspaceComponent,
    children: [
      {path: 'setup', component: SetupComponent},
      {path: 'transfer', component: TransferComponent, data: {back: '..'}},
      {path: 'delete', component: DeleteModalComponent, data: {back: '..'}},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {
}
