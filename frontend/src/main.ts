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
import {SCENARIO_CODEMIRROR_MODE} from './modes/scenario-codemirror-mode';

CodeMirror.defineSimpleMode('scenario', SCENARIO_CODEMIRROR_MODE);

import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
import groovy from 'highlight.js/lib/languages/groovy';
import yaml from 'highlight.js/lib/languages/yaml';
import bnf from 'highlight.js/lib/languages/bnf';

hljs.registerLanguage('java', java);
hljs.registerLanguage('groovy', groovy);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('bnf', bnf);

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
