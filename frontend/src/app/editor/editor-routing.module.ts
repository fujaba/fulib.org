import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FourPaneEditorComponent} from './four-pane-editor/four-pane-editor.component';

const routes: Routes = [
  {path: '', component: FourPaneEditorComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditorRoutingModule {
}
