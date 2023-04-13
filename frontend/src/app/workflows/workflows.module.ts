import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbDropdownModule, NgbNavModule} from '@ng-bootstrap/ng-bootstrap';

import {AngularSplitModule} from 'angular-split';
import {ModalModule} from '@mean-stream/ngbx';
import {SharedModule} from '../shared/shared.module';
import {DownloadESComponent} from './download-es/download-es.component';
import {MockupViewerComponent} from './mockup-viewer/mockup-viewer.component';
import {WorkflowsRoutingModule} from './workflows-routing.module';
import {WorkflowsComponent} from './workflows.component';
import {WorkflowsService} from './workflows.service';


@NgModule({
  declarations: [
    WorkflowsComponent,
    DownloadESComponent,
    MockupViewerComponent,
  ],
  imports: [
    CommonModule,
    WorkflowsRoutingModule,
    AngularSplitModule,
    SharedModule,
    NgbDropdownModule,
    FormsModule,
    NgbNavModule,
    ModalModule,
  ],
  providers: [
    WorkflowsService,
  ],
})
export class WorkflowsModule {
}
