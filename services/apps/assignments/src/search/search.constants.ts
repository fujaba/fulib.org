/**
 * This is the Lucene term byte length limit.
 * In the pathological case, a file could start with a ' or " that never closes.
 * If we allowed a greater file size, it could produce a term bigger than this limit,
 * which will be rejected by Elasticsearch.
 * Few source code files are longer than this in the academic world.
 * This repository contains only three such files that are not in .gitignore -
 * the PNPM lockfiles and gradle-wrapper.jar.
 * Neither is useful in Code Search.
 */
export const MAX_FILE_SIZE = 32766;

export const TOKEN_PATTERN = new RegExp(Object.values({
  number: /[+-]?[0-9]+(\.[0-9]+)?/,
  string: /["](\\.|[^"\\])*["]/, // NB double quotes must be escaped in Lucene RegExp
  char: /'(\\.|[^'\\])*'/,
  identifier: /[a-zA-Z$_][a-zA-Z0-9$_]*/,
  symbol: /[(){}<>\[\].,;+\-*/%|&=!?:@^\\]/,
}).map(r => r.source).join('|'), 'g');

export const MOSS_LANGUAGES = {
  c: ['.c', '.h'],
  cc: ['.cpp', '.cc', '.cxx', '.c++', '.hpp', '.hh', '.hxx', '.h++'],
  java: ['.java'],
  csharp: ['.cs'],
  python: ['.py'],
  javascript: ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'],
} as const;
