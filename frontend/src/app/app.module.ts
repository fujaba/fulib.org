import {HttpClientModule} from '@angular/common/http';
import {APP_INITIALIZER, NgModule, PlatformRef} from '@angular/core';
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

function initializeKeycloak(keycloak: KeycloakService, platformRef: PlatformRef) {
  if (!('location' in globalThis)) {
    return () => {
    };
  }
  return () => environment.auth && keycloak.init({
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
    BrowserModule.withServerTransition({appId: 'serverApp'}),
    FormsModule,
    HttpClientModule,
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
