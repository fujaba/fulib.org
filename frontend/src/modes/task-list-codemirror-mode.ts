import type {Rule} from 'codemirror';
// noinspection ES6UnusedImports
import type {} from 'codemirror/addon/mode/simple';

export const TASK_ITEM_PATTERN = /(#{2,}|-)(\s+)(.*)(\s+\(.*?)(-?\d+(?:\.\d+)?)(P?\))(\s*<!--.*?-->)?/;

export function extractTaskItem([, prefix, , description, , points, , extra]: string[]) {
  const extraData = extra ? parseExtra(extra.trim().slice(4, -3)) : {};
  return {prefix, description, points, ...extraData};
}

function parseExtra(extra: string): any {
  if (extra.startsWith('{')) {
    return JSON.parse(extra);
  } else {
    return {_id: extra};
  }
}

export const TASK_LIST_CODEMIRROR_MODE: { start: Rule[] } = {
  start: [
    {regex: TASK_ITEM_PATTERN, token: ['header', null!, 'string', null!, 'number', null!, 'meta']},
    {regex: /.+/, token: 'error'},
  ],
};
