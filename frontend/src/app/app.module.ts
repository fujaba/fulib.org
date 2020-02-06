import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http'

import { CodemirrorModule } from '@ctrl/ngx-codemirror';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './component/app.component';
import { FourPaneEditorComponent } from './component/four-pane-editor/four-pane-editor.component';

@NgModule({
  declarations: [
    AppComponent,
    FourPaneEditorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CodemirrorModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
