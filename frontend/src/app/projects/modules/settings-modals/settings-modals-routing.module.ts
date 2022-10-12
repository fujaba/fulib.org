import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DeleteModalComponent} from './delete-modal/delete-modal.component';
import {EditMemberComponent} from './edit-member/edit-member.component';
import {EditModalComponent} from './edit-modal/edit-modal.component';
import {TransferComponent} from './transfer/transfer.component';

const routes: Routes = [
  {path: 'edit', component: EditModalComponent},
  {path: 'transfer', component: TransferComponent, data: {back: '..'}},
  {path: 'delete', component: DeleteModalComponent, data: {back: '..'}},
  {path: 'edit-member', component: EditMemberComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsModalsRoutingModule {
}