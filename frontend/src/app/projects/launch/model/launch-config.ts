export type LaunchConfig =
  | CommandLaunchConfig
;

export interface BaseLaunchConfig {
  id: string;
  name: string;
}

export interface CommandLaunchConfig extends BaseLaunchConfig {
  type: 'command';
  executable: string;
  arguments?: string[];
  environment?: Record<string, string>;
  workingDirectory?: string;
}
