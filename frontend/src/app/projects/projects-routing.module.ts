import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProjectListComponent} from './components/project-list/project-list.component';
import {ProjectWorkspaceComponent} from './components/project-workspace/project-workspace.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectListComponent,
    data: {title: 'My Projects'},
    children: [
      {
        path: ':id',
        loadChildren: () => import('./modules/settings-modals/settings-modals.module').then(m => m.SettingsModalsModule),
      },
    ],
  },
  {
    path: ':id',
    component: ProjectWorkspaceComponent,
    data: {title: 'Project Workspace'},
    children: [
      {path: 'setup', loadChildren: () => import('./modules/setup/setup.module').then(m => m.SetupModule)},
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
