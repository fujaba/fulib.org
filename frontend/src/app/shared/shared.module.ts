import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {CodemirrorModule} from '@ctrl/ngx-codemirror';
import {NgbDropdownModule, NgbNavModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';

import {AutothemeCodemirrorComponent} from './autotheme-codemirror/autotheme-codemirror.component';
import {CollapseButtonComponent} from './collapse-button/collapse-button.component';
import {MarkdownComponent} from './markdown/markdown.component';
import {ModalComponent} from './modal/modal.component';
import {SafeHtmlPipe} from './pipes/safe-html.pipe';
import {SafeResourceUrlPipe} from './pipes/safe-resource-url.pipe';
import {SafeUrlPipe} from './pipes/safe-url.pipe';
import {PreviewComponent} from './preview/preview.component';
import {ProjectConfigFormComponent} from './project-config-form/project-config-form.component';
import {ScenarioCodemirrorComponent} from './scenario-codemirror/scenario-codemirror.component';
import {TabsComponent} from './tabs/tabs.component';
import { ProTipComponent } from './pro-tip/pro-tip.component';
import { RouteTabsComponent } from './route-tabs/route-tabs.component';
import { DurationPipe } from './duration.pipe';

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
    ModalComponent,
    ProjectConfigFormComponent,
    TabsComponent,
    ProTipComponent,
    RouteTabsComponent,
    DurationPipe,
  ],
  imports: [
    FormsModule,
    CommonModule,
    CodemirrorModule,
    NgbTooltipModule,
    NgbDropdownModule,
    NgbNavModule,
    RouterModule,
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
    ModalComponent,
    ProjectConfigFormComponent,
    TabsComponent,
    ProTipComponent,
    RouteTabsComponent,
    DurationPipe,
  ],
})
export class SharedModule {
}
