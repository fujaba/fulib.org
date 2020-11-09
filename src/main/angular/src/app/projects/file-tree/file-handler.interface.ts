import {File} from '../model/file.interface';

export interface FileHandler {
  open(file: File): void;

  rename(file: File): void;
}
