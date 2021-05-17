import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {SetupService} from './setup.service';
import {SetupComponent} from './setup/setup.component';


@NgModule({
  declarations: [
    SetupComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [
    SetupComponent,
  ],
})
export class SetupModule {
}
