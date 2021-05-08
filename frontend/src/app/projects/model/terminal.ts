export class Terminal {
  id: string;
  executable: string;
  arguments?: string[];
  environment?: Record<string, string>;
  workingDirectory?: string;
}
