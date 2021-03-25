import {KEYWORDS, TYPES} from './symbols';

export const scenario = (hljs) => ({
  keywords: {
    keyword: KEYWORDS,
    builtin: TYPES,
  },
  contains: [
    hljs.QUOTE_STRING_MODE,
    hljs.APOS_STRING_MODE,
    hljs.C_LINE_COMMENT_MODE,
    hljs.NUMBER_MODE,
    hljs.COMMENT('<!--', '-->'),
    hljs.COMMENT(/\(/, /\)/),
    hljs.COMMENT(/^\s*>/, /$/),
    {
      className: 'comment',
      begin: /^##/,
      end: /$/,
    },
    {
      className: 'title',
      begin: /^#/,
      end: /$/,
    },
  ],
});
