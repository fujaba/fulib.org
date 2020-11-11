import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProjectListComponent} from './project-list/project-list.component';
import {ProjectWorkspaceComponent} from './project-workspace/project-workspace.component';

const routes: Routes = [
  {path: '', component: ProjectListComponent},
  {path: ':id', component: ProjectWorkspaceComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {
}
