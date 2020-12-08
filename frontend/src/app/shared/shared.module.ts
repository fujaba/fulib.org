import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {CodemirrorModule} from '@ctrl/ngx-codemirror';
import {NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';

import {AutothemeCodemirrorComponent} from './autotheme-codemirror/autotheme-codemirror.component';
import {CollapseButtonComponent} from './collapse-button/collapse-button.component';
import {ExceptionPipe} from './pipes/exception.pipe';
import {SafeHtmlPipe} from './pipes/safe-html.pipe';
import {SafeResourceUrlPipe} from './pipes/safe-resource-url.pipe';
import {SafeUrlPipe} from './pipes/safe-url.pipe';
import {PreviewComponent} from './preview/preview.component';
import {ScenarioCodemirrorComponent} from './scenario-codemirror/scenario-codemirror.component';

@NgModule({
  declarations: [
    SafeHtmlPipe,
    SafeUrlPipe,
    SafeResourceUrlPipe,
    ExceptionPipe,
    AutothemeCodemirrorComponent,
    CollapseButtonComponent,
    ScenarioCodemirrorComponent,
    PreviewComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    CodemirrorModule,
    NgbTooltipModule,
  ],
  exports: [
    SafeHtmlPipe,
    SafeUrlPipe,
    SafeResourceUrlPipe,
    ExceptionPipe,
    AutothemeCodemirrorComponent,
    CollapseButtonComponent,
    ScenarioCodemirrorComponent,
    PreviewComponent,
  ],
})
export class SharedModule {
}
