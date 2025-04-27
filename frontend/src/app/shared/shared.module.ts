import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {CodemirrorModule} from '@ctrl/ngx-codemirror';
import {ModalModule} from '@mean-stream/ngbx';
import {NgbDropdownModule, NgbNavModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {ClipboardModule} from 'ngx-clipboard';

import {AutothemeCodemirrorComponent} from './autotheme-codemirror/autotheme-codemirror.component';
import {CollapseButtonComponent} from './collapse-button/collapse-button.component';
import {DiagramViewComponent} from './diagram-view/diagram-view.component';
import {DisabledTooltipComponent} from './disabled-tooltip/disabled-tooltip.component';
import {DurationPipe} from './duration.pipe';
import {MarkdownEditorComponent} from './markdown-editor/markdown-editor.component';
import {MarkdownComponent} from './markdown/markdown.component';
import {MaskedInputComponent} from './masked-input/masked-input.component';
import {SafeHtmlPipe} from './pipes/safe-html.pipe';
import {SafeResourceUrlPipe} from './pipes/safe-resource-url.pipe';
import {SafeUrlPipe} from './pipes/safe-url.pipe';
import {PreviewComponent} from './preview/preview.component';
import {ProTipComponent} from './pro-tip/pro-tip.component';
import {ProjectConfigFormComponent} from './project-config-form/project-config-form.component';
import {TabsComponent} from './tabs/tabs.component';
import {TokenInputComponent} from './token-input/token-input.component';

@NgModule({
  declarations: [
    SafeHtmlPipe,
    SafeUrlPipe,
    SafeResourceUrlPipe,
    AutothemeCodemirrorComponent,
    CollapseButtonComponent,
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
    MarkdownEditorComponent,
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
    MarkdownEditorComponent,
  ],
  providers: [
    DurationPipe,
  ],
})
export class SharedModule {
}
