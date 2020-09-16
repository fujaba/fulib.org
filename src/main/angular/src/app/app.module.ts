import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgBootstrapDarkmodeModule, THEME_LOADER, THEME_SAVER, ThemeLoader, ThemeSaver} from 'ng-bootstrap-darkmode';

import {AppRoutingModule} from './app-routing.module';

import {AppComponent} from './app.component';
import {ChangelogComponent} from './changelog/changelog.component';
import {ConfigComponent} from './config/config.component';
import {FeedbackComponent} from './feedback/feedback.component';
import {FooterComponent} from './footer/footer.component';
import {FourPaneEditorComponent} from './four-pane-editor/four-pane-editor.component';
import {ModalComponent} from './modal/modal.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {PrivacyService} from './privacy.service';
import {PrivacyComponent} from './privacy/privacy.component';
import {SharedModule} from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    FourPaneEditorComponent,
    ConfigComponent,
    FooterComponent,
    PageNotFoundComponent,
    ChangelogComponent,
    ModalComponent,
    FeedbackComponent,
    PrivacyComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    NgBootstrapDarkmodeModule,
    SharedModule,
    AppRoutingModule,
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
