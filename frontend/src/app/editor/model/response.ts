export class TestMethod {
  className: string;
  name: string;
  body: string;
}

export class Diagram {
  path: string;
  name: string;
  content: string;
}

export class Response {
  id: string;
  output: string;
  exitCode: number;
  methods?: TestMethod[];
  classDiagram?: string;
  objectDiagrams?: Diagram[];
}
