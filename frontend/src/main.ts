import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import * as Sentry from '@sentry/angular-ivy';

import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/groovy/groovy';
import 'codemirror/mode/properties/properties';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/yaml/yaml';
import 'codemirror/addon/mode/simple';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/anyword-hint';
import * as CodeMirror from 'codemirror';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import {SCENARIO_CODEMIRROR_MODE} from './modes/scenario-codemirror-mode';
import {TASK_LIST_CODEMIRROR_MODE} from './modes/task-list-codemirror-mode';

CodeMirror.defineSimpleMode('scenario', SCENARIO_CODEMIRROR_MODE);
CodeMirror.defineSimpleMode('task-list', TASK_LIST_CODEMIRROR_MODE);

import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
import groovy from 'highlight.js/lib/languages/groovy';
import yaml from 'highlight.js/lib/languages/yaml';
import bnf from 'highlight.js/lib/languages/bnf';
import json from 'highlight.js/lib/languages/json';
import {scenario} from './modes/scenario-highlightjs-mode';

hljs.registerLanguage('java', java);
hljs.registerLanguage('groovy', groovy);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('bnf', bnf);
hljs.registerLanguage('scenario', scenario);
hljs.registerLanguage(json.name, json);

Sentry.init({
  dsn: environment.sentryDsn,
  environment: environment.environment,
  release: 'v1',
  initialScope: {
    tags: {
      service: 'frontend',
    },
  },
});

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
