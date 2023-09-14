import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TokenModalComponent} from '../../pages/token-modal/token-modal.component';
import {assignmentChildRoutes} from './assignment-routes';
import {AssignmentComponent} from './assignment/assignment.component';
import {DeleteModalComponent} from './delete-modal/delete-modal.component';
import {ImportModalComponent} from './import-modal/import-modal.component';
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
    component: AssignmentComponent,
    data: {title: 'Assignment'},
    children: [
      ...assignmentChildRoutes,
      {path: 'token', component: TokenModalComponent, data: {title: 'Authorization Required'}},
      {
        path: 'import',
        component: ImportModalComponent,
        data: {title: 'Import'},
        children: [
          ...importChildren,
          {path: '', redirectTo: 'github', pathMatch: 'full'},
        ],
      },
      {path: 'delete', component: DeleteModalComponent, data: {title: 'Delete Assignment'}},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssignmentRoutingModule {
}
