import {HttpClient} from '@angular/common/http';
import {Component, HostListener, NgZone, OnInit, ViewChild} from '@angular/core';

import {ToastService} from 'ng-bootstrap-ext';
import {EditorConfiguration} from 'codemirror';
import {PrivacyService} from '../privacy.service';
import {LintService} from '../shared/lint.service';
import {WorkflowsService} from './workflows.service';
import {GenerateResult} from './model/GenerateResult';
import {IOutputData, SplitComponent} from 'angular-split';
import {environment} from '../../environments/environment';
import {cmWorkflowsHint} from './model/helper/workflows-hint';

@Component({
  selector: 'app-workflows',
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.scss']
})
export class WorkflowsComponent implements OnInit {
  @ViewChild('split') split!: SplitComponent;

  public content!: any;
  public codemirrorOptions: EditorConfiguration | Record<string, any>;

  public generateResult!: GenerateResult;

  public currentExampleDesc: string | null = null;
  public examplesList = ['Data Modelling', 'Microservices', 'Pages'];

  public showIframeHider = false;
  public newPageIndex: number = 0;
  public currentDisplay: 'pages' | 'objects' | 'class' = 'pages';

  public loading: boolean = false;

  constructor(
    private toastService: ToastService,
    private zone: NgZone,
    private fulibWorkflowsService: WorkflowsService,
    private privacyService: PrivacyService,
    private http: HttpClient,
    private lintService: LintService,
  ) {
    // https://angular.io/api/core/NgZone
    const generateHandler = () => this.zone.run(() => this.generate());

    this.codemirrorOptions = {
      lineNumbers: true,
      mode: 'yaml',
      extraKeys: {
        'Ctrl-Space': 'autocomplete',
        'Ctrl-S': generateHandler,
        'Cmd-S': generateHandler,
      },
      autofocus: true,
      tabSize: 2,
      hintOptions: {
        hint: cmWorkflowsHint,
      },
    };
  }

  ngOnInit() {
    this.checkForStoredContent();
  }

  private checkForStoredContent() {
    const storage = this.privacyService.getStorage('workflows');

    if (storage && !this.currentExampleDesc) {
      this.content = storage;
      this.generate();
    } else {
      this.setExample(this.currentExampleDesc);
    }
  }

  changeExampleContent(newExample: string | null) {
    this.currentExampleDesc = newExample;
    this.checkForStoredContent();
  }

  generate() {
    if (!this.currentExampleDesc) {
      this.privacyService.setStorage('workflows', this.content);
    }

    if (this.loading) return;

    const newContent = this.lintService.lintYamlString(this.content);

    if (!newContent) {
      return;
    } else {
      this.content = newContent;
    }

    this.loading = true;

    this.fulibWorkflowsService.generate(this.content).subscribe(
      (answer) => {
        this.generateResult = answer
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
        this.toastService.error('Parse Error', error.error.status + '\n' + error.error.message);
      }
    );
  }

  @HostListener('window:message', ['$event'])
  handleGlobalMessages(event: MessageEvent) {
    if (event.data.type !== 'setIndexFromIframe' && event.data.type !== 'changeFrameWithToast') {
      return;
    }

    this.newPageIndex = event.data.index;
    this.currentDisplay = event.data.diagramType;

    if (event.data.type === 'changeFrameWithToast') {
      this.toastService.success('Page Action', event.data.toastContent);
    }
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

  get url(): string {
    if (!this.generateResult || !this.generateResult.board) {
      return "";
    }
    return environment.workflowsUrl + '/workflows' + this.generateResult.board;
  }

  private setExample(exampleName: string | null) {
    if (!exampleName) {
      exampleName = 'New Workflow';
    }

    const url = `/assets/examples/workflows/${exampleName.replace(' ', '')}.es.yaml`;

    this.http.get(url, {responseType: 'text'}).subscribe(
      (value) => {
        this.content = value;
        this.generate();
      },
      () => this.toastService.warn('Warning', 'Unknown Example.'));
  }
}
