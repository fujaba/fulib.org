import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DeleteModalComponent} from './components/delete-modal/delete-modal.component';
import {EditMemberComponent} from './components/edit-member/edit-member.component';
import {EditModalComponent} from './components/edit-modal/edit-modal.component';
import {ProjectListComponent} from './components/project-list/project-list.component';
import {ProjectWorkspaceComponent} from './components/project-workspace/project-workspace.component';
import {SettingsComponent} from './components/settings/settings.component';
import {SetupComponent} from './components/setup/setup.component';
import {TransferComponent} from './components/transfer/transfer.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectListComponent,
    data: {title: 'My Projects'},
    children: [
      {path: ':id/edit', component: EditModalComponent},
      {path: ':id/transfer', component: TransferComponent, data: {back: '../..'}},
      {path: ':id/delete', component: DeleteModalComponent, data: {back: '../..'}},
      {path: ':id/edit-member', component: EditMemberComponent, data: {back: '../..'}},
    ],
  },
  {
    path: ':id',
    component: ProjectWorkspaceComponent,
    data: {title: 'Project Workspace'},
    children: [
      {
        path: 'setup',
        data: {title: 'Setup Project'},
        component: SetupComponent,
      },
    ],
  },
  {
    path: ':id/settings',
    component: SettingsComponent,
    data: {title: 'Project Settings'},
    children: [
      {path: 'transfer', component: TransferComponent, data: {back: '..'}},
      {path: 'delete', component: DeleteModalComponent, data: {back: '..'}},
      {path: 'edit-member', component: EditMemberComponent, data: {back: '..'}},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {
}
