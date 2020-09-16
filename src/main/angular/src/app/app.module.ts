import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {SharedModule} from './shared/shared.module';

import {AppRoutingModule} from './app-routing.module';

import {AppComponent} from './app.component';
import {FourPaneEditorComponent} from './four-pane-editor/four-pane-editor.component';
import {ConfigModalComponent} from './config-modal/config-modal.component';
import {FooterComponent} from './footer/footer.component';

import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {ChangelogComponent} from './changelog/changelog.component';
import {NgBootstrapDarkmodeModule, THEME_LOADER, THEME_SAVER, ThemeLoader, ThemeSaver} from 'ng-bootstrap-darkmode';
import {PrivacyService} from './privacy.service';

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
      }
    },
    {
      provide: THEME_SAVER,
      deps: [PrivacyService],
      useFactory(privacyService: PrivacyService): ThemeSaver {
        return (theme) => privacyService.setStorage('theme', theme);
      }
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
