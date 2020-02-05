import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {FourPaneEditorComponent} from "./component/four-pane-editor/four-pane-editor.component";


const routes: Routes = [
  { path: '', component: FourPaneEditorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
