import {Injectable} from "@nestjs/common";
import {createReadStream} from "fs";
import fs from "node:fs/promises";
import {MAX_FILE_SIZE, TEXT_EXTENSIONS} from "../search/search.constants";
import {Stream} from "stream";
import {Entry as ZipEntry, Parse as unzip} from "unzipper";
import {SearchService} from "../search/search.service";

@Injectable()
export class FileService {
  constructor(
    private searchService: SearchService,
  ) {
  }

  async importFiles(assignment: string, solution: string, files: Express.Multer.File[]) {
    await Promise.all(files.map(file => this.importFile(assignment, solution, file)));
  }

  async importFile(assignment: string, solution: string, file: Express.Multer.File) {
    if (file.mimetype === 'application/zip') {
      const stream = createReadStream(file.path);
      return this.importZipEntries(stream, assignment, solution);
    }

    const buffer = await fs.readFile(file.path, 'utf8');
    if (buffer.length > MAX_FILE_SIZE) {
      return;
    }
    return this.searchService.addFile(assignment, solution, file.originalname, buffer);
  }

  async importZipEntries(stream: Stream, assignment: string, solution: string, commit?: string) {
    await stream.pipe(unzip()).on('entry', (entry: ZipEntry) => {
      // Using vars.uncompressedSize because entry.extra.* and entry.size are unavailable before parsing for some reason
      if (entry.type !== 'File' || (entry.vars as any).uncompressedSize > MAX_FILE_SIZE) {
        entry.autodrain();
        return;
      }
      const extension = entry.path.substring(entry.path.lastIndexOf('.') + 1);
      if (!TEXT_EXTENSIONS.has(extension)) {
        entry.autodrain();
        return;
      }
      entry.buffer().then(buffer => {
        if (buffer.length > MAX_FILE_SIZE) {
          return;
        }
        const strippedPath = commit ? this.stripCommit(entry.path, commit) : entry.path;
        this.searchService.addFile(assignment, solution, strippedPath, buffer.toString('utf8'));
      });
    }).promise();
  }

  private stripCommit(filename: string, commit: string) {
    const index = filename.indexOf(commit);
    return index >= 0 ? filename.substring(index + commit.length + 1) : filename;
  }

}
