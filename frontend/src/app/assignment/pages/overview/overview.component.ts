import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ConfigService} from '../../services/config.service';
import {ModalComponent, ToastService, ValidatorFormComponent} from "@mean-stream/ngbx";
import {Config} from "../../model/config";

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  @ViewChild('configModal', {static: true}) configModal: TemplateRef<any>;

  config?: Config;

  protected readonly Config = Config;

  constructor(
    private configService: ConfigService,
    private toastService: ToastService,
    private modal: NgbModal,
  ) {
  }

  ngOnInit() {
    if (!this.configService.get('name')) {
      this.config = this.configService.getAll();
      this.modal.open(this.configModal);
    }
  }

  async save(form: ValidatorFormComponent<Config>, modal: ModalComponent) {
    const errors = await form.validateAll();
    if (errors.length) {
      this.toastService.error('Setup', 'Please fix the errors in the form');
      return false;
    } else {
      this.configService.setAll(this.config!);
      this.toastService.success('Setup', 'Successfully saved settings');
      modal.close('Save click');
    }
  }
}
