import {Rule} from 'codemirror';

export const TASK_ITEM_PATTERN = /(#{2,}|-)(\s+)(.*)(\s+\((?:[x\d]+P?\/)?)(-?\d+)(P?\))(\s*<!--[a-zA-Z0-9]+-->)?/;

export function extractTaskItem([_line, prefix, _1, description, _3, points, _4, id]: string[]) {
  id = id?.trim()?.slice(4, -3);
  return {prefix, description, points, id};
}

export const TASK_LIST_CODEMIRROR_MODE: { start: Rule[] } = {
  start: [
    {regex: TASK_ITEM_PATTERN, token: ['header', null!, 'string', null!, 'number', null!, 'meta']},
    {regex: /.+/, token: 'error'},
  ],
};
