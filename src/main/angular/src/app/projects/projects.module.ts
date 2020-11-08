import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {ProjectsRoutingModule} from './projects-routing.module';
import {ProjectListComponent} from './project-list/project-list.component';
import {ProjectWorkspaceComponent} from './project-workspace/project-workspace.component';

@NgModule({
  declarations: [
    ProjectListComponent,
    ProjectWorkspaceComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ProjectsRoutingModule,
    FormsModule,
  ],
})
export class ProjectsModule {
}
