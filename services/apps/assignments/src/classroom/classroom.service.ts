import {HttpService} from '@nestjs/axios';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {Method} from 'axios';
import {createReadStream} from 'fs';
import {firstValueFrom} from 'rxjs';
import {Stream} from 'stream';
import {AssignmentDocument} from '../assignment/assignment.schema';
import {AuthorInfo} from '../solution/solution.schema';
import {SolutionService} from '../solution/solution.service';
import {generateToken} from '../utils';
import {ImportSolution} from "./classroom.dto";
import {FileService} from "../file/file.service";

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

@Injectable()
export class ClassroomService {
  constructor(
    private solutionService: SolutionService,
    private fileService: FileService,
    private http: HttpService,
  ) {
  }

  async importFiles(assignment: AssignmentDocument, files: Express.Multer.File[]): Promise<ImportSolution[]> {
    const timestamp = new Date();
    const importSolutions = files.map(file => {
      const [key, value] = this.parseAuthorInfo(assignment, file.originalname);
      return {
        assignment: assignment.id,
        author: {
          email: '',
          name: '',
          studentId: '',
          [key]: value,
        },
        timestamp,
      } satisfies ImportSolution;
    })
    const solutions = await this.upsertSolutions(assignment, importSolutions);

    if (assignment.classroom?.codeSearch || assignment.moss?.userId) {
      await Promise.all(files.map(async (file, index) => {
        const stream = createReadStream(file.path);
        const solution = solutions.upsertedIds[index];
        return this.fileService.importZipEntries(stream, assignment.id, solution.toString());
      }));
    }

    return importSolutions;
  }

  private async upsertSolutions(assignment: AssignmentDocument, importSolutions: ImportSolution[]) {
    const result = await this.solutionService.bulkWrite(importSolutions.map(importSolution => {
      const [key, value] = Object.entries(importSolution.author).find(([, value]) => value)!;
      return {
        updateOne: {
          filter: {
            assignment: assignment._id,
            ['author.' + key]: value,
          },
          update: {
            $setOnInsert: {
              ...importSolution,
              token: generateToken(),
            },
          },
          upsert: true,
        },
      };
    }));
    for (let i = 0; i < importSolutions.length; i++) {
      importSolutions[i]._id = result.upsertedIds[i];
    }
    return result;
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

  async importSolutions(assignment: AssignmentDocument, usernames?: string[], reimport?: boolean): Promise<ImportSolution[]> {
    if (!assignment.classroom) {
      return [];
    }

    const {org, prefix, token, codeSearch} = assignment.classroom;
    if (!org || !prefix) {
      return [];
    }
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    let repositories = await this.getRepositories(assignment);
    if (usernames && usernames.length) {
      const usernamesSet = new Set(usernames);
      repositories = repositories.filter(repo => usernamesSet.has(this.getGithubName(repo, assignment)));
    }

    const commits = await Promise.all(repositories.map(async repo => this.getMainCommitSHA(repo, token)));
    const importSolutions = repositories.map((repo, index) => this.createImportSolution(assignment, repo, commits[index]));
    const solutions = await this.upsertSolutions(assignment, importSolutions);

    repositories.forEach((repo, i) => {
      const commit = commits[i];
      if (commit) {
        this.tag(repo, token, assignment, commit);
      }
    });

    if (codeSearch || assignment.moss?.userId || assignment.openAI?.apiKey) {
      await Promise.all(repositories.map(async (repo, i) => {
        const commit = commits[i];
        const upsertedId = solutions.upsertedIds[i];
        if (commit && upsertedId) {
          const zip = await this.getRepoZip(assignment, this.getGithubName(repo, assignment), commit);
          if (zip) {
            await this.fileService.importZipEntries(zip, assignment.id, upsertedId.toString(), commit);
          }
        }
      }));
    }

    if (reimport) {
      const otherSolutions = await this.solutionService.findAll({
        assignment: assignment._id,
        _id: {$nin: Object.values(solutions.upsertedIds)},
        'author.github': {$gt: ''},
        commit: {$gt: ''},
      });
      await Promise.all(otherSolutions.map(async solution => {
        const zip = await this.getRepoZip(assignment, solution.author.github!, solution.commit!);
        if (zip) {
          await this.fileService.importZipEntries(zip, assignment.id, solution.id, solution.commit!);
        }
      }));
      importSolutions.push(...otherSolutions);
    }

    return importSolutions;
  }

  async previewImports(assignment: AssignmentDocument): Promise<ImportSolution[]> {
    if (!assignment.classroom) {
      return [];
    }
    const {org, prefix, token} = assignment.classroom;
    if (!org || !prefix) {
      return [];
    }
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }
    const repositories = await this.getRepositories(assignment);
    return repositories
      .map(repo => this.createImportSolution(assignment, repo, undefined))
      .sort((a, b) => a.author.github!.localeCompare(b.author.github!))
      ;
  }

  private async getRepositories(assignment: AssignmentDocument): Promise<RepositoryInfo[]> {
    const token = assignment.classroom!.token!;
    const query = this.getQuery(assignment);
    const repositories: RepositoryInfo[] = [];
    let total = Number.MAX_SAFE_INTEGER;
    for (let page = 1; repositories.length < total; page++) {
      try {
        const result = await this.github<SearchResult>('GET', 'https://api.github.com/search/repositories', token, {
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
    return repositories;
  }

  private getQuery(assignment: AssignmentDocument): string {
    const {org, prefix, extraSearch} = assignment.classroom!;
    return `org:${org} "${prefix}-" in:name ${extraSearch || 'fork:true'}`;
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

  private createImportSolution(assignment: AssignmentDocument, repo: RepositoryInfo, commit: string | undefined): ImportSolution {
    return {
      assignment: assignment._id,
      author: {
        name: '',
        email: '',
        github: this.getGithubName(repo, assignment),
        studentId: '',
      },
      commit,
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
