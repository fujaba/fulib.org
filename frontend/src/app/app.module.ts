import {HttpClientModule} from '@angular/common/http';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {GridsterModule} from 'angular-gridster2';
import {KeycloakAngularModule, KeycloakService} from 'keycloak-angular';
import {NgBootstrapDarkmodeModule, THEME_LOADER, THEME_SAVER, ThemeLoader, ThemeSaver} from 'ng-bootstrap-darkmode';
import {DragulaModule} from 'ng2-dragula';

import {environment} from '../environments/environment';

import {AboutComponent} from './about/about.component';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ChangelogComponent} from './changelog/changelog.component';
import {ConfigComponent} from './config/config.component';
import {DiagramViewComponent} from './diagram-view/diagram-view.component';
import {FeedbackComponent} from './feedback/feedback.component';
import {FourPaneEditorComponent} from './four-pane-editor/four-pane-editor.component';
import {HeaderComponent} from './header/header.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {PrivacyService} from './privacy.service';
import {PrivacyComponent} from './privacy/privacy.component';
import {SharedModule} from './shared/shared.module';
import {UserModule} from './user/user.module';

function initializeKeycloak(keycloak: KeycloakService) {
  return () => keycloak.init({
    config: {
      clientId: environment.auth.clientId,
      realm: environment.auth.realm,
      url: environment.auth.url,
    },
    initOptions: {
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
    },
    bearerExcludedUrls: [
      'https://raw.githubusercontent.com/',
      'https://api.github.com',
      'https://github.com',
    ],
  });
}

@NgModule({
  declarations: [
    AppComponent,
    FourPaneEditorComponent,
    ConfigComponent,
    HeaderComponent,
    PageNotFoundComponent,
    ChangelogComponent,
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
    DragulaModule.forRoot(),
    KeycloakAngularModule,
    SharedModule,
    AppRoutingModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
