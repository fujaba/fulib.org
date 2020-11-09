import {InjectionToken} from '@angular/core';
import {File} from './model/file.interface';

export const FILE_ROOT = new InjectionToken<File>('the File describing the root of the project');
