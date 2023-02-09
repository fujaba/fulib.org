import { Socket } from "node:net";

export interface File {
  name: string;
  size: number;
  content: string | Uint8Array;
}

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

  async send(): Promise<string> {
    const socket = new Socket();
    await new Promise<void>((resolve) => socket.connect(this.port, this.server, resolve));
    await this.write(socket, `\
moss ${this.userid}
directory ${this.directories ? 1 : 0}
X ${this.experimental ? 1 : 0}
maxmatches ${this.maxMatches}
show ${this.show}
language ${this.language}
`);

    // await socket response

    const langOk = await this.read(socket);
    if (langOk.includes('no')) {
      throw new Error('Invalid language ' + this.language);
    }

    for (const baseFile of this.baseFiles) {
      await this.upload(socket, baseFile, 0);
    }

    for (let i = 0; i < this.files.length; i++) {
      await this.upload(socket, this.files[i], i + 1);
    }

    await this.write(socket, `query 0 ${this.comment}\n`);

    const response = await this.read(socket);

    await this.write(socket, 'end\n');
    socket.end();

    return response;
  }

  private async upload(socket: Socket, file: File, id: number): Promise<void> {
    await this.write(socket, `file ${id} ${this.language} ${file.size} ${file.name}\n`);
    await this.write(socket, file.content);
  }

  async write(socket: Socket, data: string | Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      socket.write(data, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async read(socket: Socket): Promise<string> {
    return new Promise((resolve) => {
      socket.once('data', (data) => {
        resolve(data.toString());
      });
    });
  }
}
