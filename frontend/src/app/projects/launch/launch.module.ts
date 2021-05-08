import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {LaunchPanelComponent} from './launch-panel/launch-panel.component';
import { CommandFormComponent } from './command-form/command-form.component';


@NgModule({
  declarations: [
    LaunchPanelComponent,
    CommandFormComponent,
  ],
    imports: [
        CommonModule,
        FormsModule,
        NgbTooltipModule,
    ],
  exports: [
    LaunchPanelComponent,
  ],
})
export class LaunchModule {
}
