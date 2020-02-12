import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {FourPaneEditorComponent} from "./four-pane-editor/four-pane-editor.component";
import {CreateComponent} from './assignment/create/create.component';
import {SolveComponent} from './assignment/solve/solve.component';
import {SolutionComponent} from './assignment/solution/solution.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';

const routes: Routes = [
  {path: '', component: FourPaneEditorComponent},
  {path: 'assignments/create', component: CreateComponent},
  {path: 'assignments/:id', component: SolveComponent},
  {path: 'assignments/:aid/solutions/:sid', component: SolutionComponent},
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
