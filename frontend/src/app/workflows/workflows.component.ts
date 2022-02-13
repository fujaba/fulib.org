import {HttpClient} from '@angular/common/http';
import {Component, NgZone, OnInit, ViewChild} from '@angular/core';

import Ajv from 'ajv';
import * as Yaml from 'js-yaml';
import {ToastService} from '../toast.service';
import {PrivacyService} from '../privacy.service';
import {WorkflowsService} from './workflows.service';
import {GenerateResult} from './model/GenerateResult';
import {IOutputData, SplitComponent} from 'angular-split';
import {workflowsSchema} from './model/helper/workflows.schema';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-workflows',
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.scss']
})
export class WorkflowsComponent implements OnInit {
  @ViewChild('split') split!: SplitComponent;

  public content!: any;
  public codemirrorOptions: any;

  public generateResult!: GenerateResult;

  public currentExampleDesc: string = 'Select example';
  public examplesList = ['New Workflow', 'Data Modelling', 'Microservices', 'Pages'];

  public showIframeHider = false;
  public newPageIndex!: number;
  public currentDisplay: 'pages' | 'objects' | 'class' = 'pages';

  private ajv!: Ajv;
  private validate!: any;
  public loading: boolean = false;

  constructor(
    private toastService: ToastService,
    private zone: NgZone,
    private fulibWorkflowsService: WorkflowsService,
    private privacyService: PrivacyService,
    private http: HttpClient,
  ) {
    // https://angular.io/api/core/NgZone
    const generateHandler = () => this.zone.run(() => this.generate());

    this.codemirrorOptions = {
      lineNumbers: true,
      mode: 'yaml',
      extraKeys: {
        'Ctrl-Space': 'autocomplete',
        'Ctrl-S': generateHandler,
      },
      autofocus: true,
      tabSize: 2,
    };
    // https://stackoverflow.com/questions/41616112/calling-components-function-from-iframe
    window.__fulib_org_setIndexFromIframe = this.setIndexFromIframe.bind(this);
    window.__fulib_org_changeFrameWithToast = this.changeFrameWithToast.bind(this);
  }

  ngOnInit() {
    this.setExample(this.examplesList[0]);
    this.ajv = new Ajv();
    this.validate = this.ajv.compile(workflowsSchema);
  }

  changeExampleContent(index: number) {
    this.currentExampleDesc = this.examplesList[index];
    this.setExample(this.currentExampleDesc);
  }

  generate() {
    this.privacyService.setStorage('workflows', this.content);

    if (this.loading) return;

    if (!this.content.includes('- workflow: ')) {
      this.toastService.error('Lint Error', 'Needs at least one workflow note (best at the beginning)');
      return;
    }

    // Replace tabs with two spaces for js-yaml and snakeyaml parser
    this.content = this.content.replace(/\t/g, '  ');

    const validYaml = this.lintYamlString();

    if (!validYaml) {
      const errorMessage = this.evaluateErrorMessage();
      this.toastService.error('Lint Error', errorMessage);
      return;
    }

    this.loading = true;

    this.fulibWorkflowsService.generate(this.content).subscribe(
      (answer) => {
        this.generateResult = answer
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;

        let errorMessage = error.error.status + '\n';
        errorMessage += error.error.message;

        this.toastService.error('Parse Error', errorMessage);
      }
    );
  }

  setIndexFromIframe(index: number, diagramType: 'pages' | 'objects' | 'class') {
    // It needs to be run in the NgZone because only then angular change detection gets a grip on the change
    this.zone.run(() => {
      this.newPageIndex = index;
      this.currentDisplay = diagramType;
    });
  }

  changeFrameWithToast(toastContent: string, index: number) {
    this.setIndexFromIframe(index, 'pages');
    this.zone.run(() => {
      this.toastService.success('Page Action', toastContent);
    });
  }

  // Source: https://github.com/angular-split/angular-split/blob/main/src/app/examples/iframes/iframes.component.ts
  dragStartHandler() {
    this.showIframeHider = true
  }

  dragEndHandler() {
    this.showIframeHider = false
  }

  splitGutterClick({gutterNum}: IOutputData) {
    // By default, clicking the gutter without changing position does not trigger the 'dragEnd' event
    // This can be fixed by manually notifying the component
    // See issue: https://github.com/angular-split/angular-split/issues/186
    this.split.notify('end', gutterNum)
  }

  openDocs() {
    window.open('https://fujaba.github.io/fulibWorkflows/docs/definitions/', '_blank')
  }

  get url(): string {
    if (!this.generateResult || !this.generateResult.board) {
      return "";
    }
    return environment.workflowsUrl + '/workflows' + this.generateResult.board;
  }

  private evaluateErrorMessage(): string {
    const errors = this.validate.errors;

    let result: string = 'Description: \n';

    // Wrong Item Index
    let index = errors[0].instancePath;

    // Cleanup Index
    index = index.replace("/", "")

    result += 'Error at entry: ' + index + '\n';

    // Evaluate correct error
    for (const error of errors) {
      if (error.keyword !== 'required') {
        const elementReference = error.params.additionalProperty;

        if (elementReference) {
          result += 'Wrong element: "' + elementReference + '"\n';
        }

        result += error.message;
        break;
      }
    }

    return result;
  }

  private lintYamlString(): boolean {
    const yaml = Yaml.load(this.content);

    return this.validate(yaml);
  }

  private setExample(exampleName: string) {
    const url = `/assets/examples/workflows/${exampleName.replace(' ', '')}.es.yaml`;
    this.http.get(url, {responseType: 'text'}).subscribe((value => {
      if (value) {
        this.content = value;
        this.generate();
      } else {
        this.toastService.warn('Warning', 'Unknown Example.');
      }
    }));
  }
}
