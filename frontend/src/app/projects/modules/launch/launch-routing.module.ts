import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {EditModalComponent} from './edit-modal/edit-modal.component';
import {LaunchPanelComponent} from './launch-panel/launch-panel.component';

const routes: Route[] = [
  {
    path: '',
    component: LaunchPanelComponent,
    children: [
      {path: 'edit/:launchId', component: EditModalComponent},
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class LaunchRoutingModule {
}
