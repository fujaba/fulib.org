import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProjectListComponent} from './project-list/project-list.component';
import {ProjectTreeComponent} from './project-tree/project-tree.component';
import {ProjectWorkspaceComponent} from './project-workspace/project-workspace.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectListComponent,
    children: [
      {path: ':id', loadChildren: () => import('./settings-modals/settings-modals.module').then(m => m.SettingsModalsModule)},
    ],
  },
  {
    path: ':id',
    component: ProjectWorkspaceComponent,
    children: [
      {path: 'setup', loadChildren: () => import('./setup/setup.module').then(m => m.SetupModule)},
      {outlet: 'panel', path: 'project', component: ProjectTreeComponent},
      {outlet: 'panel', path: 'launch', loadChildren: () => import('./launch/launch.module').then(m => m.LaunchModule)},
      {
        outlet: 'panel',
        path: 'settings',
        loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule),
      },
    ],
  },
  {
    path: ':id/settings',
    loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {
}
