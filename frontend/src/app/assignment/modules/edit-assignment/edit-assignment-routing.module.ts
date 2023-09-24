import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ClassroomComponent} from './classroom/classroom.component';
import {EditAssignmentComponent} from './edit-assignment/edit-assignment.component';
import {EditTaskModalComponent} from './edit-task-modal/edit-task-modal.component';
import {InfoComponent} from './info/info.component';
import {PreviewComponent} from './preview/preview.component';
import {TasksComponent} from './tasks/tasks.component';
import {PlagiarismDetectionComponent} from "./plagiarism-detection/plagiarism-detection.component";
import {CodeSearchComponent} from "./code-search/code-search.component";

export const editAssignmentChildRoutes: Routes = [
  {path: 'info', component: InfoComponent, data: {title: 'Info'}},
  {
    path: 'tasks',
    component: TasksComponent,
    data: {title: 'Tasks'},
    children: [
      {path: ':task', component: EditTaskModalComponent},
    ],
  },
  {path: 'classroom', component: ClassroomComponent, data: {icon: 'bi-github', title: 'Classroom'}},
  {path: 'code-search', component: CodeSearchComponent, data: {icon: 'bi-robot', title: 'Code Search'}},
  {path: 'plagiarism-detection', component: PlagiarismDetectionComponent, data: {icon: 'bi-incognito', title: 'Plagiarism Detection'}},
  {path: 'preview', component: PreviewComponent, data: {title: 'Preview'}},
];

const routes: Routes = [
  {
    path: '',
    component: EditAssignmentComponent,
    data: {title: 'Edit Assignment'},
    children: [
      ...editAssignmentChildRoutes,
      {path: '', redirectTo: 'info', pathMatch: 'full'},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditAssignmentRoutingModule {
}
