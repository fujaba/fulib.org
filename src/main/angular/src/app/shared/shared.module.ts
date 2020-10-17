import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {CodemirrorModule} from '@ctrl/ngx-codemirror';

import {SafeHtmlPipe} from '../pipes/safe-html.pipe';
import {ExceptionPipe} from '../pipes/exception.pipe';
import {AutothemeCodemirrorComponent} from '../autotheme-codemirror/autotheme-codemirror.component';
import {CollapseButtonComponent} from '../collapse-button/collapse-button.component';
import {NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {ScenarioCodemirrorComponent} from '../scenario-codemirror/scenario-codemirror.component';

@NgModule({
  declarations: [
    SafeHtmlPipe,
    ExceptionPipe,
    AutothemeCodemirrorComponent,
    CollapseButtonComponent,
    ScenarioCodemirrorComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    CodemirrorModule,
    NgbTooltipModule,
  ],
  exports: [
    SafeHtmlPipe,
    ExceptionPipe,
    AutothemeCodemirrorComponent,
    CollapseButtonComponent,
    ScenarioCodemirrorComponent,
  ],
})
export class SharedModule {
}
