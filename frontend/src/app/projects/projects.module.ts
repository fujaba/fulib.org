import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AngularSplitModule} from 'angular-split';
import {DndModule} from 'ngx-drag-drop';

import {SharedModule} from '../shared/shared.module';
import {FileTabsComponent} from './components/file-tabs/file-tabs.component';
import {ProjectListComponent} from './components/project-list/project-list.component';
import {ProjectWorkspaceComponent} from './components/project-workspace/project-workspace.component';
import {SplitPanelComponent} from './components/split-panel/split-panel.component';
import {EditorModule} from './modules/editor/editor.module';
import {SetupModule} from './modules/setup/setup.module';
import {TerminalModule} from './modules/terminal/terminal.module';
import {ProjectsRoutingModule} from './projects-routing.module';
import {ConfigService} from './services/config.service';
import {ContainerService} from './services/container.service';
import {DavClient} from './services/dav-client';
import {FileChangeService} from './services/file-change.service';
import {FileTypeService} from './services/file-type.service';
import {FileService} from './services/file.service';
import {LocalProjectService} from './services/local-project.service';
import {MemberService} from './services/member.service';
import {ProjectService} from './services/project.service';
import { SearchEverywhereComponent } from './components/search-everywhere/search-everywhere.component';
import {SearchService} from './services/search.service';

@NgModule({
  declarations: [
    FileTabsComponent,
    ProjectListComponent,
    ProjectWorkspaceComponent,
    SplitPanelComponent,
    SearchEverywhereComponent,
  ],
  imports: [
    // Angular
    CommonModule,
    FormsModule,
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
    MemberService,
    SearchService,
  ],
})
export class ProjectsModule {
}
