import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {NgxResizableModule} from '@3dgenomes/ngx-resizable';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgTerminalModule} from 'ng-terminal';
import {DndModule} from 'ngx-drag-drop';
import {SharedModule} from '../shared/shared.module';

import {ProjectsRoutingModule} from './projects-routing.module';
import {ProjectListComponent} from './project-list/project-list.component';
import {ProjectWorkspaceComponent} from './project-workspace/project-workspace.component';
import {FileTreeComponent} from './file-tree/file-tree.component';
import { FileTabsComponent } from './file-tabs/file-tabs.component';
import { ProjectTreeComponent } from './project-tree/project-tree.component';
import { SettingsComponent } from './settings/settings.component';
import { ProjectFormComponent } from './project-form/project-form.component';
import { FileCodeEditorComponent } from './file-code-editor/file-code-editor.component';
import { FileRevisionsComponent } from './file-revisions/file-revisions.component';
import { TerminalComponent } from './terminal/terminal.component';
import { FileEditorComponent } from './file-editor/file-editor.component';

@NgModule({
  declarations: [
    ProjectListComponent,
    ProjectWorkspaceComponent,
    FileTreeComponent,
    FileTabsComponent,
    ProjectTreeComponent,
    SettingsComponent,
    ProjectFormComponent,
    FileCodeEditorComponent,
    FileRevisionsComponent,
    TerminalComponent,
    FileEditorComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    NgxResizableModule,
    ProjectsRoutingModule,
    FormsModule,
    NgbModule,
    SharedModule,
    NgTerminalModule,
    DndModule,
  ],
})
export class ProjectsModule {
}
