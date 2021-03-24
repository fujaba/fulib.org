import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/clike/clike';
import 'codemirror/addon/mode/simple';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/lint/lint';
import * as CodeMirror from 'codemirror';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import {SCENARIO_MODE} from './scenario-mode';

CodeMirror.defineSimpleMode('scenario', SCENARIO_MODE);

import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
import groovy from 'highlight.js/lib/languages/groovy';

hljs.registerLanguage('java', java);
hljs.registerLanguage('groovy', groovy);

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
