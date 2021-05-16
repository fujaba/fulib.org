import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {NgTerminalModule} from 'ng-terminal';
import {SharedModule} from '../../shared/shared.module';
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
  ],
  exports: [
    TerminalTabsComponent,
  ],
})
export class TerminalModule {
}
