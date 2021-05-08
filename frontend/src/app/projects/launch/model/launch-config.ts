import {Terminal} from '../../model/terminal';

export type LaunchConfig =
  | TerminalLaunchConfig
;

export interface BaseLaunchConfig {
  id: string;
  name: string;
}

export interface TerminalLaunchConfig extends BaseLaunchConfig {
  type: 'terminal';
  terminal: Omit<Terminal, 'id'>;
}
