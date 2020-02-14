import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';

import {CodemirrorModule} from '@ctrl/ngx-codemirror';

import {SafeHtmlPipe} from '../pipes/safe-html.pipe';
import {DarkSwitchComponent} from '../dark-switch/dark-switch.component';
import {AutothemeCodemirrorComponent} from '../autotheme-codemirror/autotheme-codemirror.component';

@NgModule({
  declarations: [
    SafeHtmlPipe,
    DarkSwitchComponent,
    AutothemeCodemirrorComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    CodemirrorModule,
  ],
  exports: [
    SafeHtmlPipe,
    DarkSwitchComponent,
    AutothemeCodemirrorComponent,
  ],
})
export class SharedModule { }
