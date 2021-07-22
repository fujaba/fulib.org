import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';
import {NgTerminalModule} from 'ng-terminal';
import {SharedModule} from '../../../shared/shared.module';
import {TerminalTabsComponent} from './terminal-tabs/terminal-tabs.component';
import {TerminalComponent} from './terminal/terminal.component';


@NgModule({
  declarations: [
    TerminalComponent,
    TerminalTabsComponent,
  ],
  imports: [
    CommonModule,
    NgTerminalModule,
    SharedModule,
    NgbDropdownModule,
  ],
  exports: [
    TerminalTabsComponent,
  ],
})
export class TerminalModule {
}
