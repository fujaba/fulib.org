import {Rule} from 'codemirror';

export const TASK_ITEM_PATTERN = /(#{2,}|-)(\s+)(.*)(\s+\((?:[x\d]+P?\/)?)(-?\d+)(P?\))(\s*<!--.*?-->)?/;

export function extractTaskItem([_line, prefix, _1, description, _3, points, _4, extra]: string[]) {
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
