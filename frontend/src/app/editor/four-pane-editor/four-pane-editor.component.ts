import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, of} from 'rxjs';
import {distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators';

import {environment} from '../../../environments/environment';
import {LintService} from '../../shared/lint.service';
import {ExamplesService} from '../examples.service';
import {MarkdownService} from '../../markdown.service';
import {Marker} from '../../shared/model/marker';
import Request from '../../model/codegen/request';
import Response from '../../model/codegen/response';
import {Example} from '../model/example';
import {ExampleCategory} from '../model/example-category';
import {PrivacyService} from '../../privacy.service';
import {ScenarioEditorService} from '../../scenario-editor.service';
import {ConfigService} from '../config.service';
import {EditorService} from '../editor.service';
import {Panel} from '../model/panel';

@Component({
  selector: 'app-four-pane-editor',
  templateUrl: './four-pane-editor.component.html',
  styleUrls: ['./four-pane-editor.component.scss'],
})
export class FourPaneEditorComponent implements OnInit {
  panels: Record<string, Panel>;

  selectedExample: Example | null;
  scenarioText: string;
  response: Response | null;
  markers: Marker[] = [];
  javaCode = '// Loading...';
  outputText = 'Loading...';
  markdownHtml?: string;
  classDiagramUrl?: string;
  submitting: boolean;

  exampleCategories: ExampleCategory[];
  _activeObjectDiagramTab = 1;

  savePanels = () => {
    this.editorService.panels = this.panels;
  };

  itemId = item => item.id;

  constructor(
    private examplesService: ExamplesService,
    private editorService: EditorService,
    private configService: ConfigService,
    private lintService: LintService,
    private scenarioEditorService: ScenarioEditorService,
    private markdownService: MarkdownService,
    private privacyService: PrivacyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.panels = this.editorService.panels;

    this.exampleCategories = this.examplesService.getCategories();

    this.activatedRoute.queryParams.pipe(
      map(({example}) => example),
      distinctUntilChanged(),
      switchMap(example => {
        this.selectedExample = example ? this.examplesService.getExampleByName(example) : null;
        if (this.selectedExample) {
          this.scenarioText = '// Loading Example...';
          return this.examplesService.getScenario(this.selectedExample);
        } else {
          return of(this.editorService.storedScenario);
        }
      }),
      tap(scenario => this.scenarioText = scenario),
      switchMap(() => this.submit$()),
    ).subscribe();
  }

  submit(): void {
    if (!this.selectedExample) {
      this.editorService.storedScenario = this.scenarioText;
    }

    this.submit$().subscribe();
  }

  private submit$(): Observable<Response> {
    const packageName = this.configService.packageName;
    return of<Request>({
      privacy: this.privacyService.privacy ?? 'none',
      packageName,
      scenarioFileName: this.configService.scenarioFileName,
      scenarioText: this.scenarioText,
      selectedExample: this.selectedExample?.name,
    }).pipe(
      tap(() => this.submitting = true),
      switchMap(request => this.scenarioEditorService.submit(request)),
      tap(response => {
        this.submitting = false;
        this.response = response;
        this.javaCode = this.renderJavaCode();
        this.markdownHtml = response.html.replace(new RegExp(`/api/runcodegen/${response.id}`, 'g'),
          match => environment.apiURL + match.substring(4));
        this.classDiagramUrl = `${environment.apiURL}/runcodegen/${response.id}/model_src/${packageName.replace(/\./g, '/')}/classDiagram.svg`;

        const outputLines = this.response.output.split('\n');
        const foldedLines = this.scenarioEditorService.foldInternalCalls(this.configService.packageName, outputLines);
        this.outputText = foldedLines.join('\n');

        this.markers = this.lintService.lint(response.output);
      }),
    );
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

  selectExample(value: Example | null): void {
    this.router.navigate([], {queryParams: {example: value?.name}});
  }

  get autoSubmit(): boolean {
    return this.editorService.autoSubmit;
  }

  set autoSubmit(value: boolean) {
    this.editorService.autoSubmit = value;
  }

  resetPanels() {
    this.editorService.panels = {};
    this.panels = this.editorService.panels;
  }

  setPanelClosed(id: string, hidden: boolean): void {
    this.panels[id].closed = hidden;
    this.savePanels();
  }
}
