import {HttpClient} from '@angular/common/http';
import {Component, HostListener, NgZone, OnInit} from '@angular/core';

import {ToastService} from '@mean-stream/ngbx';
import {EditorConfiguration} from 'codemirror';
import {environment} from '../../environments/environment';
import {PrivacyService} from '../services/privacy.service';
import {GenerateResult} from './model/GenerateResult';
import {cmWorkflowsHint} from './model/helper/workflows-hint';
import {WorkflowsService} from './workflows.service';

interface Example {
  name: string;
  path: string;
}

@Component({
  selector: 'app-workflows',
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.scss'],
  standalone: false,
})
export class WorkflowsComponent implements OnInit {
  content!: string;
  codemirrorOptions: EditorConfiguration | Record<string, any>;

  generateResult?: GenerateResult;
  workflowsUrl = environment.workflowsUrl;

  currentExample: Example | null = null;
  examples: Example[] = [];

  showIframeHider = false;
  newPageIndex = 0;
  currentDisplay: 'pages' | 'objects' | 'class' = 'pages';

  loading = false;

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
    this.http.get<Example[]>(environment.workflowsUrl + '/examples').subscribe(examples => {
      this.examples = examples;
    });

    this.setExample(null);
  }

  generate() {
    if (!this.currentExample) {
      this.privacyService.setStorage('workflows', this.content);
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    this.fulibWorkflowsService.generate(this.content).subscribe(
      (answer) => {
        this.generateResult = answer;
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

  setExample(example: Example | null) {
    if (!example) {
      const storage = this.privacyService.getStorage('workflows');
      if (storage) {
        this.content = storage;
        this.generate();
      }
      return;
    }

    const url = `${environment.workflowsUrl}/examples/${example.path}`;

    this.http.get(url, {responseType: 'text'}).subscribe(
      (value) => {
        this.content = value;
        this.generate();
      },
      () => this.toastService.warn('Warning', 'Unknown Example.'));
  }
}
