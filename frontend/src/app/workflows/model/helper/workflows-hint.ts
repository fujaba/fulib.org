import CodeMirror from 'codemirror';
import {allKeywords} from './workflow-symbols';

export function cmWorkflowsHint(cm) {
  const cur = cm.getCursor();
  const range = cm.findWordAt(cur);
  const start = range.anchor.ch;
  const end = range.head.ch;

  // Get Current Word
  const word = cm.getRange(range.anchor, range.head);

  // Filter Keywords for possible completions for the current word
  const result = word.trim() ? allKeywords.filter(keyword => keyword.startsWith(word)) : allKeywords;

  return {
    list: result,
    from: CodeMirror.Pos(cur.line, start),
    to: CodeMirror.Pos(cur.line, end),
  }
}

