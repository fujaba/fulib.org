import {Component, Input, OnInit} from '@angular/core';
import {TerminalLaunchConfig} from '../model/launch-config';

@Component({
  selector: 'app-command-form',
  templateUrl: './command-form.component.html',
  styleUrls: ['./command-form.component.scss'],
})
export class CommandFormComponent implements OnInit {
  @Input() config: TerminalLaunchConfig;

  constructor() {
  }

  ngOnInit(): void {
  }

  get arguments(): string {
    return this.config.terminal.arguments?.join('\n') ?? '';
  }

  set arguments(value: string) {
    this.config.terminal.arguments = value.split('\n');
  }

  get environment(): string {
    const environment = this.config.terminal.environment;
    return environment ? Object.entries(environment).map(([k, v]) => `${k}=${v}`).join('\n') : '';
  }

  set environment(value: string) {
    const environment: Record<string, string> = {};
    for (const line of value.split('\n')) {
      const [k, v] = line.split('=', 2);
      environment[k] = v;
    }
    this.config.terminal.environment = environment;
  }
}
