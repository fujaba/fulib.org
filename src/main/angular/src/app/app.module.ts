import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http'

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {DateValueAccessorModule} from 'angular-date-value-accessor';
import {ClipboardModule} from 'ngx-clipboard';

import {SharedModule} from './shared/shared.module';

import {AppRoutingModule} from './app-routing.module';

import {AppComponent} from './app.component';
import {FourPaneEditorComponent} from './four-pane-editor/four-pane-editor.component';
import {ConfigModalComponent} from './config-modal/config-modal.component';
import {FooterComponent} from './footer/footer.component';

import { CreateComponent } from './assignment/create/create.component';
import { SolveComponent } from './assignment/solve/solve.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SolutionComponent } from './assignment/solution/solution.component';
import { TokenModalComponent } from './assignment/token-modal/token-modal.component';
import { SolutionListComponent } from './assignment/solution-list/solution-list.component';

@NgModule({
  declarations: [
    AppComponent,
    FourPaneEditorComponent,
    ConfigModalComponent,
    FooterComponent,
    CreateComponent,
    SolveComponent,
    PageNotFoundComponent,
    SolutionComponent,
    TokenModalComponent,
    SolutionListComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    SharedModule,
    DateValueAccessorModule,
    ClipboardModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
