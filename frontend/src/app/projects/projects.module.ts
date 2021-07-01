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
import {DeleteModalComponent} from './delete-modal/delete-modal.component';
import {EditModalComponent} from './edit-modal/edit-modal.component';
import {EditorModule} from './editor/editor.module';
import {FileChangeService} from './file-change.service';
import {FileRevisionsComponent} from './file-revisions/file-revisions.component';
import {FileTabsComponent} from './file-tabs/file-tabs.component';
import {FileTreeComponent} from './file-tree/file-tree.component';
import {FileTypeService} from './file-type.service';
import {FileService} from './file.service';
import {LocalProjectService} from './local-project.service';
import {ProjectFormComponent} from './project-form/project-form.component';
import {ProjectListComponent} from './project-list/project-list.component';
import {ProjectTreeComponent} from './project-tree/project-tree.component';
import {ProjectWorkspaceComponent} from './project-workspace/project-workspace.component';
import {ProjectService} from './project.service';
import {ProjectsRoutingModule} from './projects-routing.module';
import {SettingsComponent} from './settings/settings.component';
import {SetupModule} from './setup/setup.module';
import {SplitPanelComponent} from './split-panel/split-panel.component';
import {TerminalModule} from './terminal/terminal.module';
import {TransferComponent} from './transfer/transfer.component';

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
    TransferComponent,
    EditModalComponent,
    DeleteModalComponent,
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
