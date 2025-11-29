import {enableProdMode, provideZoneChangeDetection} from '@angular/core';
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
import CodeMirror from 'codemirror';
import hljs from 'highlight.js/lib/core';
import bnf from 'highlight.js/lib/languages/bnf';
import groovy from 'highlight.js/lib/languages/groovy';
import java from 'highlight.js/lib/languages/java';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import {TASK_LIST_CODEMIRROR_MODE} from './modes/task-list-codemirror-mode';

CodeMirror.defineSimpleMode('task-list', TASK_LIST_CODEMIRROR_MODE);

hljs.registerLanguage('java', java);
hljs.registerLanguage('groovy', groovy);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('bnf', bnf);
hljs.registerLanguage(json.name, json);

Sentry.init({
  enabled: environment.production,
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

platformBrowserDynamic().bootstrapModule(AppModule, {
  applicationProviders: [
    provideZoneChangeDetection({eventCoalescing: true}),
  ],
})
  .catch(err => console.error(err));
