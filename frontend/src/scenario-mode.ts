import {Rule} from 'codemirror';

interface Meta {
  dontIndentStates?: string[];
  lineComment?: string;
}

interface SimpleMode {
  [id: string]: Rule[] | Meta;

  start: Rule[];
  meta: Meta;
}

// keywords for fulibScenarios v1.7.0
export const KEYWORDS = [
  'a',
  'add',
  'adds',
  'all',
  'an',
  'and',
  'answer',
  'answers',
  'are',
  'As', 'as',
  'attribute',
  'call',
  'calls',
  'card',
  'cards',
  // 'cf.',
  'contain',
  'contains',
  'create',
  'creates',
  'do',
  'does',
  // 'e.g.',
  'empty',
  'equal',
  'Every',
  'expect',
  'false',
  'from',
  'greater',
  'has',
  'have',
  'in',
  'into',
  'is',
  'it',
  'less',
  'like',
  'link',
  'many',
  'match',
  'matches',
  'not',
  'of',
  'or',
  'on',
  'one',
  'read',
  'reads',
  'register',
  'remove',
  'removes',
  'same',
  'some',
  'take',
  'takes',
  'than',
  'that',
  'The', 'the',
  'then',
  'There', 'there',
  'through',
  'true',
  'type',
  'to',
  'We', 'we',
  'with',
  'where',
  'which',
  'whose',
  'write',
  'writes',
];

export const TYPES = [
  'void',
  'boolean',
  // numeric types
  'byte',
  'short',
  'char',
  'int',
  'long',
  'float',
  'double',
  // reference types
  'Object',
  'String',
  'Number',
  // wrapper types
  'Void',
  'Boolean',
  'Byte',
  'Short',
  'Character',
  'Integer',
  'Long',
  'Float',
  'Double',
  // lowercase variants
  'object',
  'string',
  'number',
  'character',
  'integer',
];

export const SCENARIO_MODE: SimpleMode = {
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
  },
};
