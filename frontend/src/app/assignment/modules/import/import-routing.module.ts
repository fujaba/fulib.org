import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ImportModalComponent} from "./import-modal/import-modal.component";
import {ImportGithubComponent} from "./import-github/import-github.component";
import {ImportFilesComponent} from "./import-files/import-files.component";
import {ImportEmbeddingsComponent} from "./import-embeddings/import-embeddings.component";
import {ImportMossComponent} from "./import-moss/import-moss.component";
import {ImportConsentComponent} from "./import-consent/import-consent.component";

export const importChildren = [
  {path: 'github', component: ImportGithubComponent, data: {title: 'GitHub'}},
  {path: 'files', component: ImportFilesComponent, data: {title: 'Files'}},
  {path: 'embeddings', component: ImportEmbeddingsComponent, data: {title: 'Embeddings'}},
  {path: 'moss', component: ImportMossComponent, data: {title: 'MOSS'}},
  {path: 'consent', component: ImportConsentComponent, data: {title: 'Consent'}},
];

const routes: Routes = [
  {
    path: '',
    component: ImportModalComponent,
    data: {title: 'Import'},
    children: [
      ...importChildren,
      {path: '', redirectTo: 'github', pathMatch: 'full'},
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImportRoutingModule {
}
