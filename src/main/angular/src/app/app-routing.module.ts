import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {FourPaneEditorComponent} from "./four-pane-editor/four-pane-editor.component";
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';

const routes: Routes = [
  {path: '', component: FourPaneEditorComponent},
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
