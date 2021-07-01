import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AngularSplitModule} from 'angular-split';
import {DndModule} from 'ngx-drag-drop';

import {SharedModule} from '../shared/shared.module';
import {ConfigService} from './config.service';
import {ContainerService} from './container.service';
import {DavClient} from './dav-client';
import {EditorModule} from './editor/editor.module';
import {FileChangeService} from './file-change.service';
import {FileTabsComponent} from './file-tabs/file-tabs.component';
import {FileTypeService} from './file-type.service';
import {FileService} from './file.service';
import {LocalProjectService} from './local-project.service';
import {ProjectListComponent} from './project-list/project-list.component';
import {ProjectWorkspaceComponent} from './project-workspace/project-workspace.component';
import {ProjectService} from './project.service';
import {ProjectsRoutingModule} from './projects-routing.module';
import {SetupModule} from './setup/setup.module';
import {SplitPanelComponent} from './split-panel/split-panel.component';
import {TerminalModule} from './terminal/terminal.module';

@NgModule({
  declarations: [
    FileTabsComponent,
    ProjectListComponent,
    ProjectWorkspaceComponent,
    SplitPanelComponent,
  ],
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    HttpClientModule,
    // 3rd Party
    DndModule,
    NgbModule,
    AngularSplitModule,
    // Shared
    SharedModule,
    // Routing
    ProjectsRoutingModule,
    // Submodules
    EditorModule,
    SetupModule,
    TerminalModule,
  ],
  providers: [
    ConfigService,
    ContainerService,
    DavClient,
    FileService,
    FileChangeService,
    FileTypeService,
    LocalProjectService,
    ProjectService,
  ],
})
export class ProjectsModule {
}
