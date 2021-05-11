import {FileEditor} from './file-editor';
import {TerminalStub} from './terminal';

export type OpenRequest =
  | EditorOpenRequest
  | TerminalOpenRequest
;

export interface EditorOpenRequest {
  type: 'file-editor';
  editor: FileEditor;
}

export interface TerminalOpenRequest {
  type: 'terminal';
  terminal: TerminalStub;
}
