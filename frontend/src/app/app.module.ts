import {HttpClientModule} from '@angular/common/http';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {ServiceWorkerModule} from '@angular/service-worker';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {KeycloakAngularModule, KeycloakService} from 'keycloak-angular';
import {NgBootstrapDarkmodeModule, THEME_LOADER, THEME_SAVER, ThemeLoader, ThemeSaver} from 'ng-bootstrap-darkmode';
import {DragulaModule} from 'ng2-dragula';
import {of} from 'rxjs';

import {environment} from '../environments/environment';

import {AboutComponent} from './about/about.component';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ChangelogComponent} from './changelog/changelog.component';
import {FeedbackComponent} from './feedback/feedback.component';
import {HeaderComponent} from './header/header.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {PrivacyService} from './privacy.service';
import {PrivacyComponent} from './privacy/privacy.component';
import {SharedModule} from './shared/shared.module';
import {UserModule} from './user/user.module';
import { ToastListComponent } from './toast-list/toast-list.component';
import { HomeComponent } from './home/home.component';

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
    ToastListComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    NgBootstrapDarkmodeModule,
    DragulaModule.forRoot(),
    KeycloakAngularModule,
    SharedModule,
    AppRoutingModule,
    UserModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
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
