import {JSDOM} from 'jsdom';
import {readdir, readFile} from 'node:fs/promises';
import * as path from 'path';
import {File, MossApi} from './moss-api';

(async () => {
  const dir = 'data/assignments/';
  const fileNames = await readdir(dir);
  const files = await Promise.all(fileNames.map(async (f): Promise<File> => {
    const buffer = await readFile(dir + f);
    return {
      name: f,
      size: buffer.byteLength,
      content: buffer,
    };
  }));

  const api = new MossApi();
  api.files = files;
  const url = await api.send();
  console.log(url);

  const dom = await JSDOM.fromURL(url);
  const doc = dom.window.document;

  const rows = doc.querySelectorAll('tr');
  for (const row of rows) {
    const [td1, td2, td3] = row.children;
    const a1 = td1.firstChild as HTMLAnchorElement;
    const a2 = td2.firstChild as HTMLAnchorElement;

    const link = a1.href;
    if (!link) {
      continue;
    }

    const linesMatched = +(td3.textContent?.trim() || 0);
    const file1 = parseFileAndPercentage(a1.textContent?.trim() || '');
    const file2 = parseFileAndPercentage(a2.textContent?.trim() || '');
    console.log({link: path.relative(url, link), linesMatched, file1, file2});
  }
})();

function parseFileAndPercentage(line: string) {
  const index = line.lastIndexOf(' (');
  const path = line.substring(0, index);
  const percentage = +(line.substring(index + 2, line.length - 2)) / 100;
  return {path, percentage};
}
