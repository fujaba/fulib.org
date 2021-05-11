import {FileEditor} from './file-editor';

export type OpenRequest =
  | EditorOpenRequest
;

export interface EditorOpenRequest {
  type: 'file-editor';
  editor: FileEditor;
}
