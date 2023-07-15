import {File} from '@app/moss/moss-api';
import {HttpService} from '@nestjs/axios';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {Method} from 'axios';
import * as Buffer from 'buffer';
import {createReadStream} from 'fs';
import {firstValueFrom} from 'rxjs';
import {Stream} from 'stream';
import {Entry as ZipEntry, Parse as unzip} from 'unzipper';
import {AssignmentDocument} from '../assignment/assignment.schema';
import {AssignmentService} from '../assignment/assignment.service';
import {SearchService} from '../search/search.service';
import {AuthorInfo, Solution} from '../solution/solution.schema';
import {SolutionService} from '../solution/solution.service';
import {generateToken} from '../utils';
import {ImportResult} from "./classroom.dto";
import {notFound} from "@mean-stream/nestx";

interface RepositoryInfo {
  name: string;
  pushed_at: string;
  full_name: string;
  default_branch: string;
}

interface SearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: RepositoryInfo[];
}

/**
 * This is the Lucene term byte length limit.
 * In the pathological case, a file could start with a ' or " that never closes.
 * If we allowed a greater file size, it could produce a term bigger than this limit,
 * which will be rejected by Elasticsearch.
 * Few source code files are longer than this in the academic world.
 * This repository contains only three such files that are not in .gitignore -
 * the PNPM lockfiles and gradle-wrapper.jar.
 * Neither is useful in Code Search.
 */
const MAX_FILE_SIZE = 32766;

@Injectable()
export class ClassroomService {
  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private searchService: SearchService,
    private http: HttpService,
  ) {
  }

  async importFiles(id: string, files: Express.Multer.File[]): Promise<ImportResult> {
    const assignment = await this.assignmentService.findOne(id) || notFound(id);

    const result = await this.solutionService.bulkWrite(files.map(file => {
      const [key, value] = this.parseAuthorInfo(assignment, file.originalname);
      const author: AuthorInfo = {email: '', name: '', studentId: ''};
      author[key] = value;
      const solution: Solution = {
        assignment: id,
        solution: '',
        token: generateToken(),
        author,
      };
      return {
        updateOne: {
          filter: {
            assignment: assignment._id,
            ['author.' + key]: value,
          },
          update: {$setOnInsert: solution},
          upsert: true,
        },
      };
    }));

    const {codeSearch, mossId} = assignment.classroom || {};
    if (codeSearch || mossId) {
      await Promise.all(files.map(async (file, index) => {
        const stream = createReadStream(file.path);
        const solution = result.upsertedIds[index];
        return this.importZipFiles(stream, id, solution, !!codeSearch);
      }));
    }

    return {length: result.upsertedCount};
  }

  private parseAuthorInfo(assignment: AssignmentDocument, filename: string): [keyof AuthorInfo, string] {
    let match: RegExpMatchArray | null;
    if (/[0-9]/.test(filename) && (match = filename.match(/^([a-zA-Z0-9_.-]+)\.(zip|jar)$/))) {
      return ['studentId', match[1]];
    } else if (assignment.classroom && assignment.classroom.prefix && filename.startsWith(assignment.classroom.prefix)) {
      return ['github', filename.slice(assignment.classroom.prefix.length + 1, -4)];
    } else {
      return ['name', filename.slice(0, -4)];
    }
  }

  private async importZipFiles(stream: Stream, assignment: string, solution?: string, codeSearch?: boolean, commit?: string): Promise<File[]> {
    const files = await this.importZipStream(stream);
    if (codeSearch && solution) {
      await Promise.all(files.map(file => this.addContentsToIndex(assignment, solution, file, commit)));
    }
    return files;
  }

  private async importZipStream(stream: Stream): Promise<File[]> {
    const files: File[] = [];
    await stream.pipe(unzip()).on('entry', (entry: ZipEntry) => {
      // Using vars.uncompressedSize because entry.extra.* and entry.size are unavailable before parsing for some reason
      if (entry.type !== 'File' || (entry.vars as any).uncompressedSize > MAX_FILE_SIZE) {
        entry.autodrain();
        return;
      }
      entry.buffer().then(buffer => {
        if (buffer.length > MAX_FILE_SIZE) {
          return;
        }
        files.push({name: entry.path, size: buffer.length, content: buffer});
      });
    }).promise();
    return files;
  }

  async addContentsToIndex(assignment: string, solution: string, file: File, commit?: string) {
    const content = (file.content as Buffer).toString('utf-8');
    let index: number;
    const path = commit && (index = file.name.indexOf(commit)) >= 0 ? file.name.substring(index + commit.length + 1) : file.name;
    await this.searchService.addFile(assignment, solution, path, content);
  }

  async countSolutions(assignment: AssignmentDocument): Promise<number> {
    const token = assignment.classroom?.token;
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }
    const query = this.getQuery(assignment);
    try {
      const result = await this.github<SearchResult>('GET', 'https://api.github.com/search/repositories', token!, {q: query});
      return result.total_count;
    } catch (e: any) {
      if (e.response?.status === 403) {
        throw new UnauthorizedException('Invalid token');
      }
      throw e;
    }
  }

  async importSolutions(id: string): Promise<ImportResult> {
    const assignment = await this.assignmentService.findOne(id) || notFound(id);
    if (!assignment.classroom || !assignment.classroom.org || !assignment.classroom.prefix || !assignment.classroom.token) {
      return {length: 0};
    }

    return this.importSolutions2(assignment);
  }

  async importSolutions2(assignment: AssignmentDocument): Promise<ImportResult> {
    const {token, codeSearch, mossId, openaiApiKey} = assignment.classroom!;
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    const query = this.getQuery(assignment);
    const repositories: RepositoryInfo[] = [];
    let total = Number.MAX_SAFE_INTEGER;
    for (let page = 1; repositories.length < total; page++) {
      try {
        const result = await this.github<SearchResult>('GET', 'https://api.github.com/search/repositories', token!, {
          q: query,
          per_page: 100,
          page,
        });
        total = result.total_count;
        repositories.push(...result.items);
      } catch (err: any) {
        if (err.response?.status === 401) {
          throw new UnauthorizedException('Invalid GitHub token');
        }
        throw err;
      }
    }

    const commits = await Promise.all(repositories.map(async repo => this.getMainCommitSHA(repo, token)));
    const result = await this.solutionService.bulkWrite(repositories.map((repo, index) => {
      const solution = this.createSolution(assignment, repo, commits[index]);
      return {
        updateOne: {
          filter: {
            assignment: assignment._id,
            'author.github': solution.author.github,
          },
          update: {$setOnInsert: solution},
          upsert: true,
        },
      };
    }));

    repositories.forEach((repo, i) => {
      const commit = commits[i];
      if (commit) {
        this.tag(repo, token, assignment, commit);
      }
    });

    if (!(codeSearch || mossId || openaiApiKey)) {
      return {length: result.upsertedCount};
    }

    await Promise.all(repositories.map(async (repo, i) => {
      const commit = commits[i];
      const upsertedId = result.upsertedIds[i];
      if (commit) {
        const zip = await this.getRepoZip(assignment, this.getGithubName(repo, assignment), commit);
        return zip ? this.importZipFiles(zip, assignment._id, upsertedId, !!codeSearch, commit) : [];
      } else {
        return [];
      }
    }));

    return {length: result.upsertedCount};
  }

  private getQuery(assignment: AssignmentDocument): string {
    const {org, prefix} = assignment.classroom!;
    return `org:${org} "${prefix}-" in:name`;
  }

  private async getRepoZip(assignment: AssignmentDocument, github: string, commit: string): Promise<Stream | undefined> {
    const {org, prefix} = assignment.classroom!;
    if (!github) {
      return;
    }

    try {
      const {data} = await firstValueFrom(this.http.get<Stream>(`https://api.github.com/repos/${org}/${prefix}-${github}/zipball/${commit}`, {
        headers: {
          Authorization: 'Bearer ' + assignment.classroom!.token!,
        },
        responseType: 'stream',
      }));
      return data;
    } catch (error: any) {
      console.error(`Failed to download ${org}/${prefix}-${github} zip: ${error.message}`);
      return;
    }
  }

  private tag(repo: RepositoryInfo, token: string, assignment: AssignmentDocument, commit: string) {
    return this.github('POST', `https://api.github.com/repos/${repo.full_name}/git/refs`, token!, {},
      {
        ref: `refs/tags/assignments/${assignment._id}`,
        sha: commit,
      },
    ).catch(err => {
      console.error(`Failed to tag ${repo.full_name}: ${err.message}`);
    });
  }

  private createSolution(assignment: AssignmentDocument, repo: RepositoryInfo, commit: string | undefined): Solution {
    return {
      assignment: assignment._id,
      author: {
        name: '',
        email: '',
        github: this.getGithubName(repo, assignment),
        studentId: '',
      },
      solution: '',
      commit,
      token: generateToken(),
      timestamp: new Date(repo.pushed_at),
    };
  }

  private getGithubName(repo: RepositoryInfo, assignment: AssignmentDocument): string {
    return repo.name.substring(assignment.classroom!.prefix!.length + 1);
  }

  private async getMainCommitSHA(repo: RepositoryInfo, token: string): Promise<string | undefined> {
    const url = `https://api.github.com/repos/${repo.full_name}/branches/${repo.default_branch}`;
    try {
      const branch = await this.github<{ commit?: { sha: string }; }>('GET', url, token);
      return branch.commit?.sha;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(`${repo.full_name} has no default branch ${repo.default_branch}`);
      }
      console.error(error);
    }
  }

  private async github<T>(method: Method, url: string, token: string, params: Record<string, any> = {}, body?: any): Promise<T> {
    const {data} = await firstValueFrom(this.http.request({
      params,
      method,
      url,
      data: body,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }));
    return data;
  }
}
