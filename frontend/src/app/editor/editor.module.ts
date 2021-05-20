import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbDropdownModule, NgbNavModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {GridsterModule} from 'angular-gridster2';

import {SharedModule} from '../shared/shared.module';
import {ConfigComponent} from './config/config.component';
import {DiagramViewComponent} from './diagram-view/diagram-view.component';
import {EditorRoutingModule} from './editor-routing.module';
import {ExceptionPipe} from './exception.pipe';
import {FourPaneEditorComponent} from './four-pane-editor/four-pane-editor.component';


@NgModule({
  declarations: [
    FourPaneEditorComponent,
    DiagramViewComponent,
    ConfigComponent,
    ExceptionPipe,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    NgbNavModule,
    NgbDropdownModule,
    NgbTooltipModule,
    GridsterModule,
    EditorRoutingModule,
    SharedModule,
  ],
})
export class EditorModule {
}
