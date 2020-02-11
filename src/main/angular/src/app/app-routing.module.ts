import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {FourPaneEditorComponent} from "./four-pane-editor/four-pane-editor.component";
import {CreateComponent} from './assignment/create/create.component';
import {SolveComponent} from './assignment/solve/solve.component';

const routes: Routes = [
  {path: '', component: FourPaneEditorComponent},
  {path: 'assignment/create', component: CreateComponent},
  {path: 'assignment/:id', component: SolveComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
