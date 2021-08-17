export class TerminalStub {
  id?: string;
  title?: string;
  executable: string;
  arguments?: string[];
  environment?: Record<string, string>;
  workingDirectory?: string;
}

export class Terminal extends TerminalStub {
  id: string;
}

export class Process {
  process: string; // id
  cmd: string[]; // executable + args
  workingDirectory?: string;
  environment?: Record<string, string>;
}
