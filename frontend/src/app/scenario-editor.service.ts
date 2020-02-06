import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScenarioEditorService {
  private persistenceKey = 'storedScenario';
  private defaultScenario = `# My First Scenario

// start typing your scenario or select an example using the dropdown above.

There is a Car with name Herbie.
`;

  private _storedScenario?: string;

  constructor() { }

  get storedScenario(): string {
    return this._storedScenario || localStorage.getItem(this.persistenceKey) || this.defaultScenario;
  }

  set storedScenario(value: string) {
    this._storedScenario = value;
    localStorage.setItem(this.persistenceKey, value);
  }
}
