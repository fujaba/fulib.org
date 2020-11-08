import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {NgxResizableModule} from '@3dgenomes/ngx-resizable';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {ProjectsRoutingModule} from './projects-routing.module';
import {ProjectListComponent} from './project-list/project-list.component';
import {ProjectWorkspaceComponent} from './project-workspace/project-workspace.component';
import {FileTreeComponent} from './file-tree/file-tree.component';

@NgModule({
  declarations: [
    ProjectListComponent,
    ProjectWorkspaceComponent,
    FileTreeComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    NgxResizableModule,
    ProjectsRoutingModule,
    FormsModule,
    NgbModule,
  ],
})
export class ProjectsModule {
}
