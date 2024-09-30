import {CommonModule} from '@angular/common';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbDropdownModule, NgbNavModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {GridsterModule} from 'angular-gridster2';
import {ModalModule} from '@mean-stream/ngbx';

import {SharedModule} from '../shared/shared.module';
import {ConfigComponent} from './config/config.component';
import {EditorRoutingModule} from './editor-routing.module';
import {ExceptionPipe} from './exception.pipe';
import {FourPaneEditorComponent} from './four-pane-editor/four-pane-editor.component';


@NgModule({
  declarations: [
    FourPaneEditorComponent,
    ConfigComponent,
    ExceptionPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbNavModule,
    NgbDropdownModule,
    NgbTooltipModule,
    GridsterModule,
    EditorRoutingModule,
    SharedModule,
    ModalModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class EditorModule {
}
