import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';

import {DocsRoutingModule} from './docs-routing.module';
import { OverviewComponent } from './overview/overview.component';
import { PageComponent } from './page/page.component';
import { PageNavigationComponent } from './page-navigation/page-navigation.component';


@NgModule({
  declarations: [
    OverviewComponent,
    PageComponent,
    PageNavigationComponent,
  ],
  imports: [
    CommonModule,
    DocsRoutingModule,
    SharedModule,
  ],
})
export class DocsModule {
}
