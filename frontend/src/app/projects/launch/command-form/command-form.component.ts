import {Component, Input, OnInit} from '@angular/core';
import {CommandLaunchConfig} from '../model/launch-config';

@Component({
  selector: 'app-command-form',
  templateUrl: './command-form.component.html',
  styleUrls: ['./command-form.component.scss'],
})
export class CommandFormComponent implements OnInit {
  @Input() config: CommandLaunchConfig;

  constructor() {
  }

  ngOnInit(): void {
  }

  get arguments(): string {
    return this.config.arguments?.join('\n') ?? '';
  }

  set arguments(value: string) {
    this.config.arguments = value.split('\n');
  }

  get environment(): string {
    return this.config.environment ? Object.entries(this.config.environment).map(([k, v]) => `${k}=${v}`).join('\n') : '';
  }

  set environment(value: string) {
    this.config.environment = {};
    for (const line of value.split('\n')) {
      const [k, v] = line.split('=', 2);
      this.config.environment[k] = v;
    }
  }
}
