import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DocsService {
  readonly repos = [
    {
      name: 'fulib',
      description: 'A library that provides code generation for UML like models and some model management functionalities.',
    },
    {
      name: 'fulibScenarios',
      description: 'A language and compiler for textual example scenarios.',
    },
  ];

  constructor() {
  }
}
