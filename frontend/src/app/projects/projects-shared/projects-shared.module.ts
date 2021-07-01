import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ProjectFormComponent} from './project-form/project-form.component';


@NgModule({
  declarations: [
    ProjectFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
  ],
  exports: [
    ProjectFormComponent,
  ],
})
export class ProjectsSharedModule {
}
