import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';
import {DndModule} from 'ngx-drag-drop';
import {FileRevisionsComponent} from './file-revisions/file-revisions.component';
import {FileTreeComponent} from './file-tree/file-tree.component';

import {ProjectPanelRoutingModule} from './project-panel-routing.module';
import {ProjectTreeComponent} from './project-tree/project-tree.component';


@NgModule({
  declarations: [
    FileRevisionsComponent,
    FileTreeComponent,
    ProjectTreeComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbDropdownModule,
    DndModule,
    ProjectPanelRoutingModule,
  ],
})
export class ProjectPanelModule {
}
