import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {GridsterItem} from 'angular-gridster2';

import {ExamplesService} from '../examples.service';
import {MarkdownService} from '../markdown.service';
import Request from '../model/codegen/request';
import Response from '../model/codegen/response';
import Example from '../model/example';

import ExampleCategory from '../model/example-category';
import {PrivacyService} from '../privacy.service';
import {Marker, Panels, ScenarioEditorService} from '../scenario-editor.service';

@Component({
  selector: 'app-four-pane-editor',
  templateUrl: './four-pane-editor.component.html',
  styleUrls: ['./four-pane-editor.component.scss'],
})
export class FourPaneEditorComponent implements OnInit {
  panels: Panels;

  _selectedExample: Example | null;
  scenarioText: string;
  response: Response | null;
  markers: Marker[] = [];
  javaCode = '// Loading...';
  outputText = 'Loading...';
  markdownHtml?: string;
  submitting: boolean;

  exampleCategories: ExampleCategory[];
  _activeObjectDiagramTab = 1;

  savePanels = () => {
    this.scenarioEditorService.panels = this.panels;
  };

  itemId = item => item.id;

  constructor(
    private examplesService: ExamplesService,
    private scenarioEditorService: ScenarioEditorService,
    private markdownService: MarkdownService,
    private privacyService: PrivacyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.panels = this.scenarioEditorService.panels;

    this.exampleCategories = this.examplesService.getCategories();

    this.activatedRoute.queryParams.subscribe(queryParams => {
      const exampleName = queryParams.example;
      if (exampleName) {
        this.selectedExample = this.examplesService.getExampleByName(exampleName);
      } else {
        this.selectedExample = this.scenarioEditorService.selectedExample;
      }
    });
  }

  submit(): void {
    if (!this.selectedExample) {
      this.scenarioEditorService.storedScenario = this.scenarioText;
    }

    this.submitting = true;
    const request: Request = {
      privacy: this.privacyService.privacy ?? 'none',
      packageName: this.scenarioEditorService.packageName,
      scenarioFileName: this.scenarioEditorService.scenarioFileName,
      scenarioText: this.scenarioText,
      selectedExample: this.selectedExample?.name,
    };
    this.scenarioEditorService.submit(request).subscribe(response => {
      this.submitting = false;
      this.response = response;
      this.javaCode = this.renderJavaCode();
      this.outputText = this.scenarioEditorService.foldInternalCalls(this.response.output.split('\n')).join('\n');
      this.markers = this.scenarioEditorService.lint(response);
    });
    this.markdownService.renderMarkdown(this.scenarioText).subscribe(rendered => {
      this.markdownHtml = rendered;
    });
  }

  private renderJavaCode(): string {
    if (!this.response) {
      return '';
    }

    let javaCode = '';
    for (const testMethod of this.response.testMethods ?? []) {
      javaCode += `// --------------- ${testMethod.name} in class ${testMethod.className} ---------------\n\n`;
      javaCode += testMethod.body;
      javaCode += '\n';
    }

    return javaCode;
  }

  toolSuccess(index: number) {
    return this.response && (this.response.exitCode === 0 || (this.response.exitCode % 4) > index);
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
    this.scenarioEditorService.selectedExample = value;
    this.router.navigate([], {queryParams: {example: value?.name}});
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

  setPanelClosed(id: string, hidden: boolean): void {
    this.panels[id].closed = hidden;
    this.savePanels();
  }
}
