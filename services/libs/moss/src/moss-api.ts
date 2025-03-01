import {Socket} from 'node:net';
import {Stream} from 'node:stream';
import { pipeline } from 'node:stream/promises';

export interface File {
  name: string;
  size: number;
  content: string | Uint8Array;
}

const MOSS_DEBUG = false;

export class MossApi {
  server = 'moss.stanford.edu';
  port = 7690;
  userid = 842950741;

  language = 'java';
  maxMatches = 10;
  directories = false;
  experimental = false;
  comment = '';
  show = 250;

  baseFiles: File[] = [];
  files: File[] = [];

  private socket!: Socket;

  async open() {
    this.socket = new Socket();
    await new Promise<void>((resolve) => this.socket.connect(this.port, this.server, resolve));
    await this.write(`\
moss ${this.userid}
directory ${this.directories ? 1 : 0}
X ${this.experimental ? 1 : 0}
maxmatches ${this.maxMatches}
show ${this.show}
language ${this.language}
`);

    // await socket response

    const langOk = await this.read();
    if (langOk.includes('no')) {
      throw new Error('Invalid language ' + this.language);
    }
  }

  async send(): Promise<string> {
    await this.open();

    for (const baseFile of this.baseFiles) {
      const {name, size, content} = baseFile;
      await this.upload(name, size, content, 0);
    }

    for (let i = 0; i < this.files.length; i++) {
      const {name, size, content} = this.files[i];
      await this.upload(name, size, content, i + 1);
    }

    return this.end();
  }

  async end(): Promise<string> {
    await this.write(`query 0 ${this.comment}\n`);

    const response = await this.read();

    await this.write('end\n');
    this.socket.end();

    return response.trim();
  }

  async upload(name: string, size: number, content: string | Uint8Array | Stream, id: number): Promise<void> {
    await this.write(`file ${id} ${this.language} ${size} ${name}\n`);
    await this.write(content);
  }

  async write(data: string | Uint8Array | Stream): Promise<void> {
    if (MOSS_DEBUG) {
      if (typeof data === 'string') {
        console.log('MOSS: >', data.length > 100 ? data.slice(0, 100) + '...' : data);
      } else if (data instanceof Uint8Array) {
        console.log('MOSS: > [length: ', data.length + ']');
      } else {
        console.log('MOSS: > [stream]');
      }
    }

    return new Promise((resolve, reject) => {
      if (data instanceof Stream) {
        data.once('error', reject);
        data.once('end', resolve);
        data.pipe(this.socket);
        return;
      }
      this.socket.write(data, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async read(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.socket.once('data', (data) => {
        const text = data.toString();
        if (MOSS_DEBUG) {
          console.log('MOSS: <', text);
        }
        resolve(text);
      });
      this.socket.once('error', reject);
    });
  }
}
