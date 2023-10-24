import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ConfigService} from '../../services/config.service';
import {ModalComponent} from "@mean-stream/ngbx";
import {ConfigFormComponent} from "../config-form/config-form.component";

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  @ViewChild('configModal', {static: true}) configModal: TemplateRef<any>;

  constructor(
    private configService: ConfigService,
    private modal: NgbModal,
  ) {
  }

  ngOnInit() {
    if (!this.configService.get('name')) {
      this.modal.open(this.configModal);
    }
  }

  async save(form: ConfigFormComponent, modal: ModalComponent) {
    await form.save() && modal.close('Save click');
  }
}
