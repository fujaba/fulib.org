import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {LaunchPanelComponent} from './launch-panel/launch-panel.component';


@NgModule({
  declarations: [
    LaunchPanelComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    LaunchPanelComponent,
  ],
})
export class LaunchModule {
}
