import {SearchComponent} from './search/search.component';
import {ShareComponent} from './share/share.component';
import {SolutionTableComponent} from './solution-table/solution-table.component';
import {StatisticsComponent} from './statistics/statistics.component';
import {SubmitModalComponent} from './submit-modal/submit-modal.component';
import {AssignmentTasksComponent} from './tasks/tasks.component';

export const assignmentChildRoutes = [
  {path: 'tasks', component: AssignmentTasksComponent, data: {title: 'Tasks'}},
  {path: 'share', component: ShareComponent, data: {title: 'Sharing'}},
  {
    path: 'solutions',
    component: SolutionTableComponent,
    data: {title: 'Solutions'},
    children: [
      {path: 'submit/:sid', component: SubmitModalComponent, data: {title: 'Submit Feedback'}},
    ],
  },
  {path: 'statistics', component: StatisticsComponent, data: {title: 'Statistics'}},
  {path: 'search', component: SearchComponent, data: {title: 'Code Search'}},
];
