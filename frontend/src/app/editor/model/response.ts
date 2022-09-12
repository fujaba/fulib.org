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
  testMethods?: TestMethod[];
  classDiagram?: string;
  objectDiagrams?: Diagram[];
}
