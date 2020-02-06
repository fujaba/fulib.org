import {Component, OnInit} from '@angular/core';
import {ExamplesService} from "../../examples.service";
import ExampleCategory from "../../model/example-category";
import Example from "../../model/example";
import {ScenarioEditorService} from "../../scenario-editor.service";
import Response from "../../model/codegen/response";
import Request from "../../model/codegen/request";

@Component({
  selector: 'app-four-pane-editor',
  templateUrl: './four-pane-editor.component.html',
  styleUrls: ['./four-pane-editor.component.scss']
})
export class FourPaneEditorComponent implements OnInit {
  scenarioText: string;
  response: Response | null;

  exampleCategories: ExampleCategory[];

  constructor(
    private examplesService: ExamplesService,
    private scenarioEditorService: ScenarioEditorService,
  ) {
  }

  ngOnInit() {
    this.exampleCategories = this.examplesService.getCategories();
    this.loadExample(this.selectedExample);
  }

  submit(): void {
    if (!this.selectedExample) {
      this.scenarioEditorService.storedScenario = this.scenarioText;
    }

    this.response = null;
    const request: Request = {
      privacy: 'all', // TODO
      packageName: this.scenarioEditorService.packageName,
      scenarioFileName: this.scenarioEditorService.scenarioFileName,
      scenarioText: this.scenarioText,
      selectedExample: this.selectedExample ? this.selectedExample.name : undefined,
    };
    this.scenarioEditorService.submit(request).subscribe(response => {
      this.response = response;
    });
  }

  get javaCode() {
    if (!this.response) {
      return '// Loading...'
    }

    let javaCode = '';
    if (this.response.exitCode !== 0) {
      const outputLines = this.response.output.split('\n');
      javaCode += this.foldInternalCalls(outputLines).map(line => `// ${line}\n`).join('');
    }

    for (let testMethod of this.response.testMethods || []) {
      javaCode += `// --------------- ${testMethod.name} in class ${testMethod.className} ---------------\n\n`;
      javaCode += testMethod.body;
      javaCode += '\n';
    }

    return javaCode;
  }

  private foldInternalCalls(outputLines: string[]): string[] {
    const packageName = this.scenarioEditorService.packageName.replace('/', '.');
    const packageNamePrefix = `\tat ${packageName}.`;
    const result = [];
    let counter = 0;
    for (let line of outputLines) {
      if (line.startsWith('\tat org.fulib.scenarios.tool.') ||
        line.startsWith('\tat ') && !line.startsWith('\tat org.fulib.') &&
        !line.startsWith(packageNamePrefix)) {
        counter++;
      } else {
        if (counter > 0) {
          result.push(counter === 1 ? '\t(1 internal call)' : `\t(${counter} internal calls)`);
          counter = 0;
        }
        result.push(line);
      }
    }
    return result;
  }

  private toolSuccess(index: number) {
    return this.response.exitCode == 0 || (this.response.exitCode & 3) > index;
  }

  get selectedExample() {
    return this.scenarioEditorService.selectedExample;
  }

  set selectedExample(value: Example | null) {
    this.scenarioEditorService.selectedExample = value;
    this.loadExample(value);
  }

  private loadExample(value: Example | null): void {
    if (value) {
      this.examplesService.getScenario(value).subscribe(scenario => this.scenarioText = scenario);
    } else {
      this.scenarioText = this.scenarioEditorService.storedScenario;
    }
    this.submit();
  }
}
