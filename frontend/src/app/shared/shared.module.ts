import {NgModule} from '@angular/core';

import {AutothemeCodemirrorComponent} from './autotheme-codemirror/autotheme-codemirror.component';
import {CollapseButtonComponent} from './collapse-button/collapse-button.component';
import {DisabledTooltipComponent} from './disabled-tooltip/disabled-tooltip.component';
import {DurationPipe} from './duration.pipe';
import {MarkdownEditorComponent} from './markdown-editor/markdown-editor.component';
import {MarkdownComponent} from './markdown/markdown.component';
import {MaskedInputComponent} from './masked-input/masked-input.component';
import {SafeHtmlPipe} from './pipes/safe-html.pipe';
import {SafeResourceUrlPipe} from './pipes/safe-resource-url.pipe';
import {SafeUrlPipe} from './pipes/safe-url.pipe';
import {ProTipComponent} from './pro-tip/pro-tip.component';
import {TokenInputComponent} from './token-input/token-input.component';

@NgModule({
  imports: [
    AutothemeCodemirrorComponent,
    CollapseButtonComponent,
    DisabledTooltipComponent,
    DurationPipe,
    MarkdownComponent,
    MarkdownEditorComponent,
    MaskedInputComponent,
    ProTipComponent,
    SafeHtmlPipe,
    SafeResourceUrlPipe,
    SafeUrlPipe,
    TokenInputComponent,
  ],
  exports: [
    AutothemeCodemirrorComponent,
    CollapseButtonComponent,
    DisabledTooltipComponent,
    DurationPipe,
    MarkdownComponent,
    MarkdownEditorComponent,
    MaskedInputComponent,
    ProTipComponent,
    SafeHtmlPipe,
    SafeResourceUrlPipe,
    SafeUrlPipe,
    TokenInputComponent,
  ],
  providers: [
    DurationPipe,
  ],
})
export class SharedModule {
}
