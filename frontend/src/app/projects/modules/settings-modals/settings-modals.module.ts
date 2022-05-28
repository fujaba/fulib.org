import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbTypeaheadModule} from '@ng-bootstrap/ng-bootstrap';
import {ModalModule} from 'ng-bootstrap-ext';
import {SharedModule} from '../../../shared/shared.module';
import {UserModule} from '../../../user/user.module';
import {ProjectsSharedModule} from '../projects-shared/projects-shared.module';
import {DeleteModalComponent} from './delete-modal/delete-modal.component';
import {EditMemberComponent} from './edit-member/edit-member.component';
import {EditModalComponent} from './edit-modal/edit-modal.component';

import {SettingsModalsRoutingModule} from './settings-modals-routing.module';
import {TransferComponent} from './transfer/transfer.component';


@NgModule({
  declarations: [
    DeleteModalComponent,
    EditModalComponent,
    TransferComponent,
    EditMemberComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbTypeaheadModule,
    SharedModule,
    ProjectsSharedModule,
    SettingsModalsRoutingModule,
    UserModule,
    ModalModule,
  ],
})
export class SettingsModalsModule {
}
