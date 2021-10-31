import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AssignmentComponent} from './pages/assignment/assignment.component';
import {CourseComponent} from './pages/course/course.component';
import {CreateCourseComponent} from './pages/create-course/create-course.component';
import {CreateSolutionComponent} from './pages/create-solution/create-solution.component';
import {ClassroomComponent} from './pages/edit-assignment/classroom/classroom.component';
import {EditAssignmentComponent} from './pages/edit-assignment/edit-assignment.component';
import {InfoComponent} from './pages/edit-assignment/info/info.component';
import {PreviewComponent} from './pages/edit-assignment/preview/preview.component';
import {SampleComponent} from './pages/edit-assignment/sample/sample.component';
import {TasksComponent} from './pages/edit-assignment/tasks/tasks.component';
import {TemplateComponent} from './pages/edit-assignment/template/template.component';
import {EditTaskModalComponent} from './pages/edit-task-modal/edit-task-modal.component';
import {EvaluationModalComponent} from './pages/evaluation-modal/evaluation-modal.component';
import {MyAssignmentsComponent} from './pages/my-assignments/my-assignments.component';
import {MyCoursesComponent} from './pages/my-courses/my-courses.component';
import {MySolutionsComponent} from './pages/my-solutions/my-solutions.component';
import {SolutionComponent} from './pages/solution/solution.component';
import {TokenModalComponent} from './pages/token-modal/token-modal.component';

const editChildren: Routes = [
  {path: 'info', component: InfoComponent},
  {path: 'classroom', component: ClassroomComponent},
  {
    path: 'tasks', component: TasksComponent, children: [
      {path: ':task', component: EditTaskModalComponent},
    ],
  },
  {path: 'template', component: TemplateComponent},
  {path: 'sample', component: SampleComponent},
  {path: 'preview', component: PreviewComponent},
];

const routes: Routes = [
  {path: '', component: MyAssignmentsComponent},
  {path: 'solutions', component: MySolutionsComponent},
  {path: 'courses', component: MyCoursesComponent},
  {
    path: 'create',
    component: EditAssignmentComponent,
    children: editChildren,
  },
  {path: ':aid', component: CreateSolutionComponent},
  {
    path: ':aid/edit',
    component: EditAssignmentComponent,
    children: editChildren,
  },
  {
    path: ':aid/solutions',
    component: AssignmentComponent,
    children: [
      {path: 'token', component: TokenModalComponent},
    ],
  },
  {
    path: ':aid/solutions/:sid',
    component: SolutionComponent,
    children: [
      {path: 'token', component: TokenModalComponent},
      {path: 'tasks/:task', component: EvaluationModalComponent},
    ],
  },
  {path: 'courses/create', component: CreateCourseComponent},
  {path: 'courses/:cid', component: CourseComponent},
  {path: 'courses/:cid/assignments/:aid', component: CourseComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssignmentRoutingModule {
}
