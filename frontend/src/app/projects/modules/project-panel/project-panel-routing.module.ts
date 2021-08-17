import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ProjectTreeComponent} from './project-tree/project-tree.component';

const routes: Routes = [
  {path: '', component: ProjectTreeComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectPanelRoutingModule { }
