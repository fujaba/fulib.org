import {Component} from '@angular/core';
import {ToastService, ValidatorFormComponent} from "@mean-stream/ngbx";
import {Config} from "../../model/config";
import {ConfigService} from "../../services/config.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: false,
})
export class SettingsComponent {
  config = this.configService.getAll();

  protected readonly Config = Config;

  constructor(
    private configService: ConfigService,
    private toastService: ToastService,
  ) {
  }

  async save(form: ValidatorFormComponent<Config>): Promise<boolean> {
    const errors = await form.validateAll();
    if (errors.length) {
      this.toastService.error('Settings', 'Please fix the errors in the form');
      return false;
    } else {
      this.configService.setAll(this.config);
      this.toastService.success('Settings', 'Successfully saved settings');
      return true;
    }
  }
}
