import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {UserModule} from '../../../user/user.module';
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
        UserModule,
    ],
})
export class SettingsModule {
}
