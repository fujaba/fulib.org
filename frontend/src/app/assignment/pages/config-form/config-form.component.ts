import { Component } from '@angular/core';
import {ToastService} from 'ng-bootstrap-ext';
import {CONFIG_OPTIONS, ConfigService} from '../../services/config.service';

@Component({
  selector: 'app-config-form',
  templateUrl: './config-form.component.html',
  styleUrls: ['./config-form.component.scss']
})
export class ConfigFormComponent {
  options = CONFIG_OPTIONS;
  optionValues = this.configService.getAll();

  constructor(
    private configService: ConfigService,
    private toastService: ToastService,
  ) {
  }

  save() {
    this.configService.setAll(this.optionValues);
    this.toastService.success('Settings', 'Successfully saved settings');
  }
}
