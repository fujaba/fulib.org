import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {CodemirrorModule} from '@ctrl/ngx-codemirror';

import {SafeHtmlPipe} from '../pipes/safe-html.pipe';
import {DarkSwitchComponent} from '../dark-switch/dark-switch.component';
import {AutothemeCodemirrorComponent} from '../autotheme-codemirror/autotheme-codemirror.component';
import {CollapseButtonComponent} from '../collapse-button/collapse-button.component';
import {NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    SafeHtmlPipe,
    DarkSwitchComponent,
    AutothemeCodemirrorComponent,
    CollapseButtonComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    CodemirrorModule,
    NgbTooltipModule,
  ],
  exports: [
    SafeHtmlPipe,
    DarkSwitchComponent,
    AutothemeCodemirrorComponent,
    CollapseButtonComponent,
  ],
})
export class SharedModule {
}
