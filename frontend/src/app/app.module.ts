import {HttpClientModule} from '@angular/common/http';
import {ApplicationRef, DoBootstrap, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {GridsterModule} from 'angular-gridster2';
import {KeycloakAngularModule, KeycloakService} from 'keycloak-angular';
import {NgBootstrapDarkmodeModule, THEME_LOADER, THEME_SAVER, ThemeLoader, ThemeSaver} from 'ng-bootstrap-darkmode';

import {environment} from '../environments/environment';

import {AboutComponent} from './about/about.component';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ChangelogComponent} from './changelog/changelog.component';
import {ConfigComponent} from './config/config.component';
import {FeedbackComponent} from './feedback/feedback.component';
import {FourPaneEditorComponent} from './four-pane-editor/four-pane-editor.component';
import {HeaderComponent} from './header/header.component';
import {ModalComponent} from './modal/modal.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {PrivacyService} from './privacy.service';
import {PrivacyComponent} from './privacy/privacy.component';
import {SharedModule} from './shared/shared.module';
import {UserModule} from './user/user.module';
import { DiagramViewComponent } from './diagram-view/diagram-view.component';

const keycloakService = new KeycloakService();

@NgModule({
  declarations: [
    AppComponent,
    FourPaneEditorComponent,
    ConfigComponent,
    HeaderComponent,
    PageNotFoundComponent,
    ChangelogComponent,
    ModalComponent,
    FeedbackComponent,
    PrivacyComponent,
    AboutComponent,
    DiagramViewComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    NgBootstrapDarkmodeModule,
    GridsterModule,
    KeycloakAngularModule,
    SharedModule,
    AppRoutingModule,
    UserModule,
  ],
  providers: [
    {
      provide: THEME_LOADER,
      deps: [PrivacyService],
      useFactory(privacyService: PrivacyService): ThemeLoader {
        return () => privacyService.getStorage('theme');
      },
    },
    {
      provide: THEME_SAVER,
      deps: [PrivacyService],
      useFactory(privacyService: PrivacyService): ThemeSaver {
        return (theme) => privacyService.setStorage('theme', theme);
      },
    },
    {
      provide: KeycloakService,
      useValue: keycloakService,
    },
  ],
  entryComponents: [AppComponent],
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
        // fixes an issue where keycloak-js would send refresh_token=undefined
        checkLoginIframe: false,
      },
    }).then(() => {
      appRef.bootstrap(AppComponent);
    }).catch(error => {
      console.log('failed to init keycloak', error);
    });
  }
}
