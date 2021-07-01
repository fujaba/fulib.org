import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProjectListComponent} from './components/project-list/project-list.component';
import {ProjectWorkspaceComponent} from './components/project-workspace/project-workspace.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectListComponent,
    children: [
      {path: ':id', loadChildren: () => import('./modules/settings-modals/settings-modals.module').then(m => m.SettingsModalsModule)},
    ],
  },
  {
    path: ':id',
    component: ProjectWorkspaceComponent,
    children: [
      {path: 'setup', loadChildren: () => import('./modules/setup/setup.module').then(m => m.SetupModule)},
      {outlet: 'panel', path: 'project', loadChildren: () => import('./modules/project-panel/project-panel.module').then(m => m.ProjectPanelModule)},
      {outlet: 'panel', path: 'launch', loadChildren: () => import('./modules/launch/launch.module').then(m => m.LaunchModule)},
      {
        outlet: 'panel',
        path: 'settings',
        loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule),
      },
    ],
  },
  {
    path: ':id/settings',
    loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {
}
