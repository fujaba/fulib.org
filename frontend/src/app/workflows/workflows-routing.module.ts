import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {WorkflowsComponent} from './workflows.component';
import {DownloadESComponent} from './download-es/download-es.component';
import {PreviewComponent} from '../shared/preview/preview.component';

const routes: Routes = [
  {
    path: '',
    component: WorkflowsComponent,
    data: {title: 'Workflows Editor'},
    children: [
      {
        path: 'download',
        component: DownloadESComponent,
        data: {title: 'Download'}
      },
      {
        path: 'preview',
        component: PreviewComponent,
        data: {title: 'Preview'},
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowsRoutingModule {
}
