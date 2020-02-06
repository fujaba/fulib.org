import {Component, OnInit} from '@angular/core';
import {ExamplesService} from "../../examples.service";
import ExampleCategory from "../../model/example-category";
import Example from "../../model/example";
import {ScenarioEditorService} from "../../scenario-editor.service";

@Component({
  selector: 'app-four-pane-editor',
  templateUrl: './four-pane-editor.component.html',
  styleUrls: ['./four-pane-editor.component.scss']
})
export class FourPaneEditorComponent implements OnInit {
  scenarioText: string;
  javaCode: string = 'System.out.println("Hello World");';

  exampleCategories: ExampleCategory[];
  _selectedExample: Example | null;

  constructor(
    private examplesService: ExamplesService,
    private scenarioEditorService: ScenarioEditorService,
  ) { }

  ngOnInit() {
    this.scenarioText = this.scenarioEditorService.storedScenario;
    this.exampleCategories = this.examplesService.getCategories();
  }

  submit(): void {
    console.log('submit');
    if (!this.selectedExample) {
      this.scenarioEditorService.storedScenario = this.scenarioText;
    }
  }

  get selectedExample() {
    return this._selectedExample;
  }

  set selectedExample(value: Example | null) {
    this._selectedExample = value;
    if (value) {
      this.examplesService.getScenario(value).subscribe(scenario => this.scenarioText = scenario);
    }
    else {
      this.scenarioText = this.scenarioEditorService.storedScenario;
    }
    this.submit();
  }
}
