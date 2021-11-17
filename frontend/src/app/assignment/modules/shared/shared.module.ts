import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {AuthorNameComponent} from './author-name/author-name.component';
import {TaskColorPipe} from './pipes/task-color.pipe';
import {TaskListComponent} from './task-list/task-list.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgbTooltipModule,
  ],
  declarations: [
    AuthorNameComponent,
    TaskListComponent,
    TaskColorPipe,
  ],
  exports: [
    AuthorNameComponent,
    TaskListComponent,
    TaskColorPipe,
  ],
})
export class AssignmentSharedModule {
}
