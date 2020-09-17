interface Meta {
  dontIndentStates?: string[];
  lineComment?: string
}

// https://codemirror.net/demo/simplemode.html
interface State {
  regex?: string | RegExp;
  token?: string | (string | null)[] | null;
  sol?: boolean;
  next?: string;
  push?: string;
  pop?: boolean;
  mode?: { spec: string, end: string, persistent?: boolean };
  indent?: boolean;
  dedent?: boolean;
  dedentIfLineStart?: boolean;
}

interface SimpleMode {
  [id: string]: State[] | Meta;

  meta: Meta;
}

// keywords for fulibScenarios v1.4.2
export const Keywords = [
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
  'expect',
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
  'to',
  'We', 'we',
  'with',
  'where',
  'which',
  'whose',
  'write',
  'writes',
];

export const ScenarioMode: SimpleMode = {
  start: [
    {regex: /\s*#+.*$/, token: 'header', sol: true},
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
    {regex: new RegExp(`(?:${Keywords.join('|')})\\b`), token: 'keyword'},
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
  meta: {
    lineComment: '//',
  },
};
