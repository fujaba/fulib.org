import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {DocsRoutingModule} from './docs-routing.module';
import { OverviewComponent } from './overview/overview.component';


@NgModule({
  declarations: [
    OverviewComponent,
  ],
  imports: [
    CommonModule,
    DocsRoutingModule,
  ],
})
export class DocsModule {
}
