import {readdir, readFile} from 'node:fs/promises';
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
})();
