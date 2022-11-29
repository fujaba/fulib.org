import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import * as CodeMirror from 'codemirror';
import 'codemirror/addon/hint/anyword-hint';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/mode/simple';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/groovy/groovy';
import 'codemirror/mode/javascript/javascript';

import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/properties/properties';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/yaml/yaml';
import hljs from 'highlight.js/lib/core';
import bnf from 'highlight.js/lib/languages/bnf';
import groovy from 'highlight.js/lib/languages/groovy';
import java from 'highlight.js/lib/languages/java';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import {SCENARIO_CODEMIRROR_MODE} from './modes/scenario-codemirror-mode';
import {scenario} from './modes/scenario-highlightjs-mode';
import {TASK_LIST_CODEMIRROR_MODE} from './modes/task-list-codemirror-mode';

CodeMirror.defineSimpleMode('scenario', SCENARIO_CODEMIRROR_MODE);
CodeMirror.defineSimpleMode('task-list', TASK_LIST_CODEMIRROR_MODE);

hljs.registerLanguage('java', java);
hljs.registerLanguage('groovy', groovy);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('bnf', bnf);
hljs.registerLanguage('scenario', scenario);
hljs.registerLanguage(json.name, json);

if (environment.production) {
  enableProdMode();
}

function bootstrap() {
  platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));
}

if (document.readyState === 'complete') {
  bootstrap();
} else {
  document.addEventListener('DOMContentLoaded', bootstrap);
}

