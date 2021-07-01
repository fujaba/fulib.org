import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DeleteModalComponent} from './delete-modal/delete-modal.component';
import {EditModalComponent} from './edit-modal/edit-modal.component';
import {LaunchPanelComponent} from './launch/launch-panel/launch-panel.component';
import {ProjectListComponent} from './project-list/project-list.component';
import {ProjectTreeComponent} from './project-tree/project-tree.component';
import {ProjectWorkspaceComponent} from './project-workspace/project-workspace.component';
import {SettingsComponent} from './settings/settings.component';
import {SetupComponent} from './setup/setup/setup.component';
import {TransferComponent} from './transfer/transfer.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectListComponent,
    children: [
      {path: ':id/edit', component: EditModalComponent},
      {path: ':id/transfer', component: TransferComponent, data: {back: '../..'}},
      {path: ':id/delete', component: DeleteModalComponent, data: {back: '../..'}},
    ],
  },
  {
    path: ':id',
    component: ProjectWorkspaceComponent,
    children: [
      {outlet: 'panel', path: 'project', component: ProjectTreeComponent},
      {outlet: 'panel', path: 'launch', loadChildren: () => import('./launch/launch.module').then(m => m.LaunchModule)},
      {
        outlet: 'panel',
        path: 'settings',
        component: SettingsComponent,
        children: [
          {path: 'setup', component: SetupComponent},
          {path: 'transfer', component: TransferComponent, data: {back: '..'}},
          {path: 'delete', component: DeleteModalComponent, data: {back: '..'}},
        ],
      },
    ],
  },
  {
    path: ':id/settings',
    component: SettingsComponent,
    children: [
      {path: 'transfer', component: TransferComponent, data: {back: '..'}},
      {path: 'delete', component: DeleteModalComponent, data: {back: '..'}},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {
}
