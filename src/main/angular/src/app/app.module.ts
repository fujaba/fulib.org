import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http'

import {CodemirrorModule} from '@ctrl/ngx-codemirror';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {AppRoutingModule} from './app-routing.module';

import {SafeHtmlPipe} from "./pipes/safe-html.pipe";

import {AppComponent} from './app.component';
import {FourPaneEditorComponent} from './four-pane-editor/four-pane-editor.component';
import {ConfigModalComponent} from './config-modal/config-modal.component';
import {FooterComponent} from './footer/footer.component';

import {DarkSwitchComponent} from './dark-switch/dark-switch.component';
import { CreateComponent } from './assignment/create/create.component';

@NgModule({
  declarations: [
    SafeHtmlPipe,
    AppComponent,
    FourPaneEditorComponent,
    ConfigModalComponent,
    FooterComponent,
    DarkSwitchComponent,
    CreateComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    CodemirrorModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
