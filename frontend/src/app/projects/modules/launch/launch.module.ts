import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbDropdownModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../../../shared/shared.module';
import {CommandFormComponent} from './command-form/command-form.component';
import {EditModalComponent} from './edit-modal/edit-modal.component';
import {LaunchPanelComponent} from './launch-panel/launch-panel.component';
import {LaunchRoutingModule} from './launch-routing.module';
import {LaunchService} from './launch.service';


@NgModule({
  declarations: [
    LaunchPanelComponent,
    CommandFormComponent,
    EditModalComponent,
  ],
  imports: [
    LaunchRoutingModule,
    CommonModule,
    FormsModule,
    NgbTooltipModule,
    NgbDropdownModule,
    SharedModule,
  ],
  providers: [
    LaunchService,
  ],
})
export class LaunchModule {
}
