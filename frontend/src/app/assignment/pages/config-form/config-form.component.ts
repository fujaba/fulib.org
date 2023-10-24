import {Component, ViewChild} from '@angular/core';
import {ToastService, ValidatorFormComponent} from '@mean-stream/ngbx';
import {ConfigService} from '../../services/config.service';
import {Config} from "../../model/config";
import {validate} from "class-validator";

@Component({
  selector: 'app-config-form',
  templateUrl: './config-form.component.html',
  styleUrls: ['./config-form.component.scss']
})
export class ConfigFormComponent {
  @ViewChild('form') form: ValidatorFormComponent<Config>;

  config = this.configService.getAll();

  protected readonly Config = Config;

  constructor(
    private configService: ConfigService,
    private toastService: ToastService,
  ) {
  }

  async save() {
    const errors = await this.form.validateAll();
    if (errors.length) {
      this.toastService.error('Settings', 'Please fix the errors in the form');
    } else {
      this.configService.setAll(this.config);
      this.toastService.success('Settings', 'Successfully saved settings');
    }
  }
}
