import {Component, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

import {AutothemeCodemirrorComponent} from '../autotheme-codemirror/autotheme-codemirror.component';

import {ExamplesService} from '../examples.service';
import {ScenarioEditorService} from '../scenario-editor.service';

import ExampleCategory from '../model/example-category';
import Example from '../model/example';
import Response from '../model/codegen/response';
import Request from '../model/codegen/request';
import {PrivacyService} from '../privacy.service';

@Component({
  selector: 'app-four-pane-editor',
  templateUrl: './four-pane-editor.component.html',
  styleUrls: ['./four-pane-editor.component.scss']
})
export class FourPaneEditorComponent implements OnInit, OnDestroy {
  @ViewChild('scenarioInput', {static: true}) scenarioInput: AutothemeCodemirrorComponent;

  _selectedExample: Example | null;
  scenarioText: string;
  response: Response | null;
  javaCode: string = '// Loading...';
  submitting: boolean;

  exampleCategories: ExampleCategory[];
  _activeObjectDiagramTab: number = 1;

  submitHandler = () => this.zone.run(() => this.submit());
  annotationHandler = () => this.zone.run(() => this.getAnnotations());

  constructor(
    private examplesService: ExamplesService,
    private scenarioEditorService: ScenarioEditorService,
    private privacyService: PrivacyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private zone: NgZone,
  ) {
  }

  ngOnInit() {
    this.exampleCategories = this.examplesService.getCategories();

    this.scenarioInput.contentChange.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
    ).subscribe(() => {
      if (this.autoSubmit) {
        this.submit();
      }
    });

    this.activatedRoute.queryParams.subscribe(queryParams => {
      const exampleName: string = queryParams.example;
      this.selectedExample = exampleName ? this.examplesService.getExampleByName(exampleName) : this.scenarioEditorService.selectedExample;
    })
  }

  ngOnDestroy() {
    this.scenarioInput.contentChange.unsubscribe();
  }

  submit(): void {
    if (!this.selectedExample) {
      this.scenarioEditorService.storedScenario = this.scenarioText;
    }

    this.submitting = true;
    const request: Request = {
      privacy: this.privacyService.privacy,
      packageName: this.scenarioEditorService.packageName,
      scenarioFileName: this.scenarioEditorService.scenarioFileName,
      scenarioText: this.scenarioText,
      selectedExample: this.selectedExample?.name,
    };
    this.scenarioEditorService.submit(request).subscribe(response => {
      this.submitting = false;
      this.response = response;
      this.javaCode = this.renderJavaCode();
    });
  }

  private renderJavaCode(): string {
    let javaCode = '';
    if (this.response.exitCode !== 0) {
      const outputLines = this.response.output.split('\n');
      javaCode += this.foldInternalCalls(outputLines).map(line => `// ${line}\n`).join('');
    }

    for (let testMethod of this.response.testMethods ?? []) {
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
      if (line.startsWith('\tat org.fulib.scenarios.tool.')
        || line.startsWith('\tat ') && !line.startsWith('\tat org.fulib.') && !line.startsWith(packageNamePrefix)) {
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

  toolSuccess(index: number) {
    return this.response.exitCode == 0 || (this.response.exitCode & 3) > index;
  }

  getAnnotations(): { severity: string, message: string, from: { line: number, ch: number }, to: { line: number, ch: number } }[] {
    if (!this.response) {
      return [];
    }

    const result = [];

    for (const line of this.response.output.split('\n')) {
      const match = /^.*\.md:(\d+):(\d+)(?:-(\d+))?: (error|warning|note): (.*)$/.exec(line);
      if (!match) {
        continue;
      }

      const row = +match[1] - 1;
      const col = +match[2];
      const endCol = +(match[3] || col) + 1;
      const severity = match[4];
      const message = match[5];

      result.push({
        severity,
        message,
        from: {line: row, ch: col},
        to: {line: row, ch: endCol},
      });
    }

    return result;
  }

  get activeObjectDiagramTab(): number {
    const numDiagrams = this.response?.objectDiagrams?.length ?? 0;
    return Math.min(this._activeObjectDiagramTab, numDiagrams);
  }

  set activeObjectDiagramTab(value: number) {
    this._activeObjectDiagramTab = value;
  }

  get selectedExample() {
    return this._selectedExample;
  }

  set selectedExample(value: Example | null) {
    this._selectedExample = value;
    this.loadExample(value);
  }

  selectExample(value: Example | null): void {
    this.selectedExample = value;
    this.router.navigate([], {queryParams: {example: value?.name}});
    this.scenarioEditorService.selectedExample = value;
  }

  private loadExample(value: Example | null): void {
    if (value) {
      this.response = null;
      this.scenarioText = '// Loading Example...';
      this.examplesService.getScenario(value).subscribe(scenario => {
        this.scenarioText = scenario;
        this.submit();
      });
    } else {
      this.scenarioText = this.scenarioEditorService.storedScenario;
      this.submit();
    }
  }

  get autoSubmit(): boolean {
    return this.scenarioEditorService.autoSubmit;
  }

  set autoSubmit(value: boolean) {
    this.scenarioEditorService.autoSubmit = value;
  }
}
