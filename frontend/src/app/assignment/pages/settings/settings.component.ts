import {Component} from '@angular/core';
import {ToastService} from 'ng-bootstrap-ext';
import {CONFIG_OPTIONS, ConfigService} from '../../services/config.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
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
