import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AngularSplitModule} from 'angular-split';
import {NgTerminalModule} from 'ng-terminal';
import {DndModule} from 'ngx-drag-drop';

import {SharedModule} from '../shared/shared.module';
import {EditorModule} from './editor/editor.module';
import {FileRevisionsComponent} from './file-revisions/file-revisions.component';
import {FileTabsComponent} from './file-tabs/file-tabs.component';
import {FileTreeComponent} from './file-tree/file-tree.component';
import {ProjectFormComponent} from './project-form/project-form.component';
import {ProjectListComponent} from './project-list/project-list.component';
import {ProjectTreeComponent} from './project-tree/project-tree.component';
import {ProjectWorkspaceComponent} from './project-workspace/project-workspace.component';
import {ProjectsRoutingModule} from './projects-routing.module';
import {SettingsComponent} from './settings/settings.component';
import {SplitPanelComponent} from './split-panel/split-panel.component';
import {TabsComponent} from './tabs/tabs.component';
import {TerminalTabsComponent} from './terminal-tabs/terminal-tabs.component';
import {TerminalComponent} from './terminal/terminal.component';

@NgModule({
  declarations: [
    FileRevisionsComponent,
    FileTabsComponent,
    FileTreeComponent,
    ProjectFormComponent,
    ProjectListComponent,
    ProjectTreeComponent,
    ProjectWorkspaceComponent,
    SettingsComponent,
    SplitPanelComponent,
    TabsComponent,
    TerminalComponent,
    TerminalTabsComponent,
  ],
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    HttpClientModule,
    // 3rd Party
    DndModule,
    NgbModule,
    NgTerminalModule,
    AngularSplitModule,
    // Shared
    SharedModule,
    // Routing
    ProjectsRoutingModule,
    // Submodules
    EditorModule,
  ],
})
export class ProjectsModule {
}
