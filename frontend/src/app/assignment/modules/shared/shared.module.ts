import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {NgbDropdownModule, NgbTooltipModule, NgbTypeaheadModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../../../shared/shared.module';
import {AssignmentInfoComponent} from './assignment-info/assignment-info.component';
import {AuthorNameComponent} from './author-name/author-name.component';
import {ImportExportComponent} from './import-export/import-export.component';
import {TaskColorPipe} from './pipes/task-color.pipe';
import {SnippetComponent} from './snippet/snippet.component';
import {StatisticValueComponent} from './statistic-value/statistic-value.component';
import {TaskListComponent} from './task-list/task-list.component';
import { SolutionNamePipe } from './pipes/solution-name.pipe';
import { GithubLinkPipe } from './pipes/github-link.pipe';
import { CloneLinkPipe } from './pipes/clone-link.pipe';
import { AssignmentActionsComponent } from './assignment-actions/assignment-actions.component';
import { AssigneeInputComponent } from './assignee-input/assignee-input.component';
import { TimetrackingComponent } from './timetracking/timetracking.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgbTooltipModule,
    SharedModule,
    NgbDropdownModule,
    NgbTypeaheadModule,
    FormsModule,
  ],
  declarations: [
    AssignmentInfoComponent,
    AuthorNameComponent,
    ImportExportComponent,
    SnippetComponent,
    TaskListComponent,
    TaskColorPipe,
    SolutionNamePipe,
    StatisticValueComponent,
    GithubLinkPipe,
    CloneLinkPipe,
    AssignmentActionsComponent,
    AssigneeInputComponent,
    TimetrackingComponent,
  ],
  exports: [
    AssignmentInfoComponent,
    AuthorNameComponent,
    ImportExportComponent,
    SnippetComponent,
    TaskListComponent,
    TaskColorPipe,
    SolutionNamePipe,
    StatisticValueComponent,
    GithubLinkPipe,
    CloneLinkPipe,
    AssignmentActionsComponent,
    AssigneeInputComponent,
    TimetrackingComponent,
  ],
})
export class AssignmentSharedModule {
}
