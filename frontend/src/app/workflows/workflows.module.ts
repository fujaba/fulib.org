import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';

import {AngularSplitModule} from 'angular-split';
import {WorkflowsService} from './workflows.service';
import {SharedModule} from '../shared/shared.module';
import {WorkflowsComponent} from './workflows.component';
import {WorkflowsRoutingModule} from './workflows-routing.module';
import {DownloadESComponent} from './download-es/download-es.component';


@NgModule({
  declarations: [
    WorkflowsComponent,
    DownloadESComponent
  ],
  imports: [
    CommonModule,
    WorkflowsRoutingModule,
    AngularSplitModule,
    SharedModule,
    NgbDropdownModule,
    FormsModule
  ],
  providers: [
    WorkflowsService
  ]
})
export class WorkflowsModule {
}
