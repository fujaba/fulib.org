import {Rule} from 'codemirror';
import {KEYWORDS, TYPES} from './symbols';

export const SCENARIO_CODEMIRROR_MODE: Record<string, Rule[]> & { start: Rule[] } = {
  start: [
    {regex: /(\s*)(##)(.*)$/, token: [null!, 'header', 'comment'], sol: true},
    {regex: /(\s*)(#)(.*)$/, token: [null!, 'header', 'def'], sol: true},
    {regex: /(\s*)(>)(.*)$/, token: [null!, 'header', 'comment'], sol: true},
    {regex: /(\s*)(```)(.*)$/, token: [null!, 'string', 'meta'], sol: true, next: 'codeBlock'},
    {regex: /\/\/.*/, token: 'comment'},
    {regex: /\s*[+*-]/, token: 'operator', sol: true},
    {regex: /\s*[0-9]\./, token: 'number', sol: true},
    {regex: /[.,+:]/, token: 'operator'},
    {regex: /-?[0-9]+(?:\.[0-9]+)?/, token: 'number'},
    {regex: /'/, token: 'string', next: 'singleString'},
    {regex: /"/, token: 'string', next: 'doubleString'},
    {regex: /\(/, token: 'comment', next: 'parenComment'},
    {regex: /<!--/, token: 'comment', next: 'htmlComment'},
    {regex: /!\[/, token: 'image'},
    {regex: /]\(/, token: 'image', next: 'fileName'},
    {regex: new RegExp(`(?:${TYPES.join('|')})(?![a-zA-Z0-9'_-])`), token: 'type'},
    {regex: new RegExp(`(?:${KEYWORDS.join('|')})(?![a-zA-Z0-9'_-])`), token: 'keyword'},
    {regex: /[a-zA-Z_][a-zA-Z0-9'_-]*/, token: 'variable'},
  ],
  parenComment: [
    {regex: /.*?\)/, token: 'comment', next: 'start'},
    {regex: /.*/, token: 'comment'},
  ],
  htmlComment: [
    {regex: /.*?-->/, token: 'comment', next: 'start'},
    {regex: /.*/, token: 'comment'},
  ],
  singleString: [
    {regex: /\\[btnfr"'\\]/, token: 'keyword'},
    {regex: /\\./, token: 'error'},
    {regex: /[^\\]*?'/, token: 'string', next: 'start'},
    {regex: /[^\\]*/, token: 'string'},
  ],
  doubleString: [
    {regex: /\\[btnfr"'\\]/, token: 'keyword'},
    {regex: /\\./, token: 'error'},
    {regex: /[^\\]*?"/, token: 'string', next: 'start'},
    {regex: /[^\\]*/, token: 'string'},
  ],
  fileName: [
    {regex: /\)/, token: 'image', next: 'start'},
    {regex: /[^)]*/, token: 'string'},
  ],
  codeBlock: [
    {regex: /\s*```$/, token: 'string', sol: true, next: 'start'},
    {regex: /.*$/, token: 'string', sol: true},
  ],
  meta: {
    lineComment: '//',
  } as any,
};
