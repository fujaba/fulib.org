import {Component} from '@angular/core';
import {ToastService} from '@mean-stream/ngbx';
import {ConfigService} from '../../services/config.service';
import {Config} from "../../model/config";

@Component({
  selector: 'app-config-form',
  templateUrl: './config-form.component.html',
  styleUrls: ['./config-form.component.scss']
})
export class ConfigFormComponent {
  config = this.configService.getAll();

  protected readonly Config = Config;

  constructor(
    private configService: ConfigService,
    private toastService: ToastService,
  ) {
  }

  save() {
    this.configService.setAll(this.config);
    this.toastService.success('Settings', 'Successfully saved settings');
  }
}
