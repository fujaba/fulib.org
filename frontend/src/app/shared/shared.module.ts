import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {CodemirrorModule} from '@ctrl/ngx-codemirror';
import {NgbDropdownModule, NgbNavModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {ModalModule} from '@mean-stream/ngbx';
import {ClipboardModule} from 'ngx-clipboard';

import {AutothemeCodemirrorComponent} from './autotheme-codemirror/autotheme-codemirror.component';
import {CollapseButtonComponent} from './collapse-button/collapse-button.component';
import {DiagramViewComponent} from './diagram-view/diagram-view.component';
import {DurationPipe} from './duration.pipe';
import {MarkdownComponent} from './markdown/markdown.component';
import {SafeHtmlPipe} from './pipes/safe-html.pipe';
import {SafeResourceUrlPipe} from './pipes/safe-resource-url.pipe';
import {SafeUrlPipe} from './pipes/safe-url.pipe';
import {PreviewComponent} from './preview/preview.component';
import {ProTipComponent} from './pro-tip/pro-tip.component';
import {ProjectConfigFormComponent} from './project-config-form/project-config-form.component';
import {ScenarioCodemirrorComponent} from './scenario-codemirror/scenario-codemirror.component';
import {TabsComponent} from './tabs/tabs.component';
import {TokenInputComponent} from './token-input/token-input.component';
import {MaskedInputComponent} from './masked-input/masked-input.component';
import {DisabledTooltipComponent} from './disabled-tooltip/disabled-tooltip.component';

@NgModule({
  declarations: [
    SafeHtmlPipe,
    SafeUrlPipe,
    SafeResourceUrlPipe,
    AutothemeCodemirrorComponent,
    CollapseButtonComponent,
    ScenarioCodemirrorComponent,
    PreviewComponent,
    MarkdownComponent,
    ProjectConfigFormComponent,
    ProjectConfigFormComponent,
    TabsComponent,
    ProTipComponent,
    DurationPipe,
    DiagramViewComponent,
    TokenInputComponent,
    MaskedInputComponent,
    DisabledTooltipComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    CodemirrorModule,
    NgbTooltipModule,
    NgbDropdownModule,
    NgbNavModule,
    RouterModule,
    ModalModule,
    ClipboardModule,
  ],
  exports: [
    SafeHtmlPipe,
    SafeUrlPipe,
    SafeResourceUrlPipe,
    AutothemeCodemirrorComponent,
    CollapseButtonComponent,
    ScenarioCodemirrorComponent,
    PreviewComponent,
    MarkdownComponent,
    ProjectConfigFormComponent,
    ProjectConfigFormComponent,
    TabsComponent,
    ProTipComponent,
    DurationPipe,
    DiagramViewComponent,
    TokenInputComponent,
    MaskedInputComponent,
    DisabledTooltipComponent,
  ],
  providers: [
    DurationPipe,
  ],
})
export class SharedModule {
}
