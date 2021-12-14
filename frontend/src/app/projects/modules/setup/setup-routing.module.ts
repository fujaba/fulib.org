import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SetupComponent} from './setup/setup.component';

const routes: Routes = [
  {
    path: '',
    data: {title: 'Setup Project'},
    component: SetupComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetupRoutingModule {
}
