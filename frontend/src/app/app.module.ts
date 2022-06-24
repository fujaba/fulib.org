import {HttpClientModule} from '@angular/common/http';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {KeycloakAngularModule, KeycloakService} from 'keycloak-angular';
import {NgBootstrapDarkmodeModule, THEME_LOADER, THEME_SAVER, ThemeLoader, ThemeSaver} from 'ng-bootstrap-darkmode';
import {ModalModule, ToastModule} from 'ng-bootstrap-ext';
import {of} from 'rxjs';

import {environment} from '../environments/environment';

import {AboutComponent} from './components/about/about.component';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ChangelogComponent} from './components/changelog/changelog.component';
import {FeedbackComponent} from './components/feedback/feedback.component';
import {HeaderComponent} from './components/header/header.component';
import {HomeComponent} from './components/home/home.component';
import {PageNotFoundComponent} from './components/page-not-found/page-not-found.component';
import {PrivacyService} from './services/privacy.service';
import {PrivacyComponent} from './components/privacy/privacy.component';
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
    HeaderComponent,
    PageNotFoundComponent,
    ChangelogComponent,
    FeedbackComponent,
    PrivacyComponent,
    AboutComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgbModule,
    NgBootstrapDarkmodeModule,
    KeycloakAngularModule,
    SharedModule,
    AppRoutingModule,
    UserModule,
    ToastModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
    ModalModule,
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
        // TODO: Make this an Observable that automatically listens for changes to localStorage
        return () => of(privacyService.getStorage('theme'));
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
