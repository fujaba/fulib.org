import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {FourPaneEditorComponent} from './four-pane-editor/four-pane-editor.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {FeedbackComponent} from './feedback/feedback.component';
import {PrivacyComponent} from './privacy/privacy.component';
import {ConfigComponent} from './config/config.component';
import {ChangelogComponent} from './changelog/changelog.component';

const routes: Routes = [
  {path: '', component: FourPaneEditorComponent},
  {path: 'assignments', loadChildren: () => import('./assignment/assignment.module').then(m => m.AssignmentModule)},
  {path: '**', component: PageNotFoundComponent},
  {outlet: 'modal', path: 'feedback', component: FeedbackComponent},
  {outlet: 'modal', path: 'privacy', component: PrivacyComponent},
  {outlet: 'modal', path: 'config', component: ConfigComponent},
  {outlet: 'modal', path: 'changelog', component: ChangelogComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
