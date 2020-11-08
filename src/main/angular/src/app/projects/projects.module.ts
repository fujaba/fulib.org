import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {ProjectsRoutingModule} from './projects-routing.module';
import {ProjectListComponent} from './project-list/project-list.component';

@NgModule({
  declarations: [
    ProjectListComponent,
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
  ],
})
export class ProjectsModule {
}
