import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TokenModalComponent} from '../../pages/token-modal/token-modal.component';
import {CommentListComponent} from './comment-list/comment-list.component';
import {DeleteModalComponent} from './delete-modal/delete-modal.component';
import {SolutionDetailsComponent} from './details/details.component';
import {EvaluationModalComponent} from './evaluation-modal/evaluation-modal.component';
import {SolutionShareComponent} from './share/share.component';
import {SolutionComponent} from './solution/solution.component';
import {SolutionTasksComponent} from './tasks/tasks.component';
import {SimilarModalComponent} from "./similar-modal/similar-modal.component";
import {AssigneeFeedbackComponent} from "./assignee-feedback/assignee-feedback.component";

export const solutionChildRoutes: Routes = [
  {
    path: 'tasks', component: SolutionTasksComponent, data: {title: 'Tasks'}, children: [
      {path: 'feedback', component: AssigneeFeedbackComponent, data: {title: 'Feedback'}},
      {path: ':task', component: EvaluationModalComponent, data: {title: 'Evaluation'}},
      {path: ':task/similar', component: SimilarModalComponent, data: {title: 'Similar Solutions'}},
    ],
  },
  {
    path: 'details', component: SolutionDetailsComponent, data: {title: 'Student Info'}, children: [
      {path: 'delete', component: DeleteModalComponent, data: {title: 'Delete Solution'}},
    ],
  },
  {path: 'share', component: SolutionShareComponent, data: {title: 'Sharing'}},
  {path: 'comments', component: CommentListComponent, data: {title: 'Comments'}},
];

const routes: Routes = [
  {
    path: '',
    component: SolutionComponent,
    data: {title: 'Solution'},
    children: [
      ...solutionChildRoutes,
      {path: 'token', component: TokenModalComponent, data: {title: 'Authorization Required'}},
      {path: '', redirectTo: 'tasks', pathMatch: 'full'},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolutionRoutingModule {
}
