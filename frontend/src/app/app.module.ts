import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {ErrorHandler, NgModule, inject, provideAppInitializer} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {
  ModalModule,
  NgbxDarkmodeModule,
  THEME_LOADER,
  THEME_SAVER,
  ThemeLoader,
  ThemeSaver,
  ToastModule,
} from '@mean-stream/ngbx';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {KeycloakAngularModule, KeycloakService} from 'keycloak-angular';

import {environment} from '../environments/environment';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AboutComponent} from './components/about/about.component';
import {ChangelogComponent} from './components/changelog/changelog.component';
import {FeedbackComponent} from './components/feedback/feedback.component';
import {HeaderComponent} from './components/header/header.component';
import {HomeComponent} from './components/home/home.component';
import {PageNotFoundComponent} from './components/page-not-found/page-not-found.component';
import {PrivacyComponent} from './components/privacy/privacy.component';
import {PrivacyService} from './services/privacy.service';
import {SharedModule} from './shared/shared.module';
import {UserModule} from './user/user.module';
import * as Sentry from '@sentry/angular-ivy';

function initializeKeycloak(keycloak: KeycloakService) {
  return () => environment.auth && keycloak.init({
    config: {
      clientId: environment.auth.clientId,
      realm: environment.auth.realm,
      url: environment.auth.url,
    },
    initOptions: {
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
      messageReceiveTimeout: 2000,
    },
    bearerExcludedUrls: [
      'https://raw.githubusercontent.com/',
      'https://api.github.com',
      'https://github.com',
    ],
  }).catch(console.error);
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
    BrowserAnimationsModule,
    NgbModule,
    NgbxDarkmodeModule,
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
    provideAppInitializer(() => {
      const initializerFn = (initializeKeycloak)(inject(KeycloakService));
      return initializerFn();
    }),
    {
      provide: THEME_LOADER,
      deps: [PrivacyService],
      useFactory(privacyService: PrivacyService): ThemeLoader {
        return () => privacyService.getStorage$('theme');
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
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler(),
    },
    provideHttpClient(withInterceptorsFromDi()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
