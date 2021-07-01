import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ProjectsSharedModule} from '../projects-shared/projects-shared.module';

import {SettingsRoutingModule} from './settings-routing.module';
import {SettingsComponent} from './settings/settings.component';


@NgModule({
  declarations: [
    SettingsComponent,
  ],
  imports: [
    CommonModule,
    ProjectsSharedModule,
    SettingsRoutingModule,
  ],
})
export class SettingsModule {
}
