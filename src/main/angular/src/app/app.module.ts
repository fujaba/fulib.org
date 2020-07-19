import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {ApplicationRef, DoBootstrap, NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http'

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {SharedModule} from './shared/shared.module';

import {AppRoutingModule} from './app-routing.module';

import {AppComponent} from './app.component';
import {FourPaneEditorComponent} from './four-pane-editor/four-pane-editor.component';
import {ConfigModalComponent} from './config-modal/config-modal.component';
import {FooterComponent} from './footer/footer.component';

import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ChangelogComponent } from './changelog/changelog.component';
import {KeycloakAngularModule, KeycloakService} from "keycloak-angular";
import {environment} from "../environments/environment";

const keycloakService = new KeycloakService();

@NgModule({
  declarations: [
    AppComponent,
    FourPaneEditorComponent,
    ConfigModalComponent,
    FooterComponent,
    PageNotFoundComponent,
    ChangelogComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    KeycloakAngularModule,
    SharedModule,
    AppRoutingModule,
  ],
  providers: [
    {
      provide: KeycloakService,
      useValue: keycloakService,
    }
  ],
})
export class AppModule implements DoBootstrap {
  ngDoBootstrap(appRef: ApplicationRef): void {
    keycloakService.init({
      config: {
        clientId: environment.authClientId,
        realm: 'fulib.org',
        url: environment.authURL,
      },
      initOptions: {
        onLoad: 'check-sso',
      },
    }).then(() => {
      appRef.bootstrap(AppComponent);
    }).catch(error => {
      console.log('failed to init keycloak', error);
    });
  }
}
