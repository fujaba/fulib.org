import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ClassroomComponent} from './classroom/classroom.component';
import {EditAssignmentComponent} from './edit-assignment/edit-assignment.component';
import {EditTaskModalComponent} from './edit-task-modal/edit-task-modal.component';
import {InfoComponent} from './info/info.component';
import {PreviewComponent} from './preview/preview.component';
import {TasksComponent} from './tasks/tasks.component';

export const editAssignmentChildRoutes: Routes = [
  {path: 'info', component: InfoComponent, data: {title: 'Info'}},
  {path: 'classroom', component: ClassroomComponent, data: {icon: 'github', title: 'Classroom'}},
  {
    path: 'tasks',
    component: TasksComponent,
    data: {title: 'Tasks'},
    children: [
      {path: ':task', component: EditTaskModalComponent},
    ],
  },
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
