import {Component, OnInit} from '@angular/core';
import {ExamplesService} from "../../examples.service";
import ExampleCategory from "../../model/example-category";
import Example from "../../model/example";

@Component({
  selector: 'app-four-pane-editor',
  templateUrl: './four-pane-editor.component.html',
  styleUrls: ['./four-pane-editor.component.scss']
})
export class FourPaneEditorComponent implements OnInit {
  scenarioText: string = 'test foo bar';
  javaCode: string = 'System.out.println("Hello World");';

  exampleCategories: ExampleCategory[];
  _selectedExample: Example;

  constructor(
    private examplesService: ExamplesService,
  ) { }

  ngOnInit() {
    this.exampleCategories = this.examplesService.getCategories();
  }

  submit(): void {
    console.log('submit');
  }

  get selectedExample() {
    return this._selectedExample;
  }

  set selectedExample(value: Example) {
    this._selectedExample = value;
    this.examplesService.getScenario(value).subscribe(scenario => this.scenarioText = scenario);
  }
}
