import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ImportRoutingModule} from './import-routing.module';
import {ImportConsentComponent} from "./import-consent/import-consent.component";
import {ImportModalComponent} from "./import-modal/import-modal.component";
import {ImportGithubComponent} from "./import-github/import-github.component";
import {ImportFilesComponent} from "./import-files/import-files.component";
import {ImportMossComponent} from "./import-moss/import-moss.component";
import {ImportEmbeddingsComponent} from "./import-embeddings/import-embeddings.component";
import {FormsModule} from "@angular/forms";
import {ModalModule, RouteTabsModule} from "@mean-stream/ngbx";
import {AssignmentSharedModule} from "../shared/shared.module";


@NgModule({
  declarations: [
    ImportModalComponent,
    ImportGithubComponent,
    ImportFilesComponent,
    ImportMossComponent,
    ImportEmbeddingsComponent,
    ImportConsentComponent,
  ],
  imports: [
    CommonModule,
    ImportRoutingModule,
    FormsModule,
    RouteTabsModule,
    ModalModule,
    AssignmentSharedModule
  ]
})
export class ImportModule {
}
