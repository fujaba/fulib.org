import {Component, OnInit} from '@angular/core';
import {CONFIG_OPTIONS, ConfigService} from '../../services/config.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  options = CONFIG_OPTIONS;
  optionValues = this.configService.getAll();

  constructor(
    private configService: ConfigService,
  ) {
  }

  ngOnInit(): void {
  }

  save() {
    this.configService.setAll(this.optionValues);
  }
}
