import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PreviewComponent} from '../shared/preview/preview.component';
import {ConfigComponent} from './config/config.component';
import {FourPaneEditorComponent} from './four-pane-editor/four-pane-editor.component';

const routes: Routes = [
  {
    path: '',
    component: FourPaneEditorComponent,
    data: {title: 'Scenario Editor'},
    children: [
      {path: 'config', component: ConfigComponent, data: {title: 'Configure Project'}},
      {path: 'preview', component: PreviewComponent, data: {title: 'Preview'}},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditorRoutingModule {
}
