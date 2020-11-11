import TestMethod from './test-method';
import Diagram from './diagram';

export default class Response {
  id: string;
  output: string;
  exitCode: number;
  testMethods?: TestMethod[];
  classDiagram?: string;
  objectDiagrams?: Diagram[];
  html: string;
}
