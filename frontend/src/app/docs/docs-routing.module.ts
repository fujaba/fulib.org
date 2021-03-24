import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OverviewComponent} from './overview/overview.component';
import {PageComponent} from './page/page.component';

const routes: Routes = [
  {path: ':repo/:page', component: PageComponent},
  {path: ':repo', redirectTo: ':repo/README'},
  {path: '', component: OverviewComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocsRoutingModule {
}
