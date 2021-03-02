import {File} from './file';

export type FileChanged = FileCreated | FileDeleted | FileModified | FileMoved;

export interface FileCreated {
  event: 'created';
  file: File;
}

export interface FileDeleted {
  event: 'deleted';
  file: File;
}

export interface FileModified {
  event: 'modified';
  file: File;
}

export interface FileMoved {
  event: 'moved';
  to: File;
}
