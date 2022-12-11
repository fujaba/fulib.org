import {HttpService} from '@nestjs/axios';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {Method} from 'axios';
import {createReadStream} from 'fs';
import {firstValueFrom} from 'rxjs';
import {Stream} from 'stream';
import {Entry as ZipEntry, Parse as unzip} from 'unzipper';
import {AssignmentDocument} from '../assignment/assignment.schema';
import {AssignmentService} from '../assignment/assignment.service';
import {SearchService} from '../search/search.service';
import {ReadSolutionDto} from '../solution/solution.dto';
import {AuthorInfo, Solution, SolutionDocument} from '../solution/solution.schema';
import {SolutionService} from '../solution/solution.service';
import {generateToken} from '../utils';

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

  async importFiles(id: string, files: Express.Multer.File[]): Promise<ReadSolutionDto[]> {
    const assignment = await this.assignmentService.findOne(id);
    if (!assignment) {
      return [];
    }

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

    if (assignment.classroom?.codeSearch) {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const stream = createReadStream(file.path);
        const solution = result.upsertedIds[index];
        this.importZipStream(stream, id, solution);
      }
    }

    return this.solutionService.findAll({_id: {$in: Object.values(result.upsertedIds)}});
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

  private importZipStream(stream: Stream, assignment: string, solution: string, commit?: string) {
    stream.pipe(unzip()).on('entry', (entry: ZipEntry) => {
      // Using vars.uncompressedSize because entry.extra.* and entry.size are unavailable before parsing for some reason
      if (entry.type !== 'File' || (entry.vars as any).uncompressedSize > MAX_FILE_SIZE) {
        entry.autodrain();
        return;
      }
      entry.buffer().then(buffer => {
        if (buffer.length > MAX_FILE_SIZE) {
          return;
        }
        const content = buffer.toString('utf-8');
        let index: number;
        const path = commit && (index = entry.path.indexOf(commit)) >= 0 ? entry.path.substring(index + commit.length + 1) : entry.path;
        this.searchService.addFile(assignment, solution, path, content);
      });
    });
  }

  async importSolutions(id: string): Promise<ReadSolutionDto[]> {
    const assignment = await this.assignmentService.findOne(id);
    if (!assignment || !assignment.classroom || !assignment.classroom.org || !assignment.classroom.prefix || !assignment.classroom.token) {
      return [];
    }

    const ids = await this.importSolutions2(assignment);
    return this.solutionService.findAll({_id: {$in: ids}});
  }

  async importSolutions2(assignment: AssignmentDocument): Promise<string[]> {
    const {token, codeSearch} = assignment.classroom!;
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

    const writes = await Promise.all(repositories.map(async repo => {
      const solution = await this.createSolution(assignment, repo);
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
    const result = await this.solutionService.bulkWrite(writes);

    if (codeSearch) {
      const solutions = await this.solutionService.findAll({assignment: assignment.id});
      for (const solution of solutions) {
        this.addContentsToIndex(assignment, solution as SolutionDocument);
      }
    }

    return Object.values(result.upsertedIds);
  }

  private getQuery(assignment: AssignmentDocument): string {
    const {org, prefix} = assignment.classroom!;
    return `org:${org} "${prefix}-" in:name`;
  }

  private addContentsToIndex(assignment: AssignmentDocument, solution: SolutionDocument) {
    const {org, prefix} = assignment.classroom!;
    const {author: {github}, commit} = solution;
    if (!github) {
      return;
    }

    this.http.get<Stream>(`https://api.github.com/repos/${org}/${prefix}-${github}/zipball/${commit}`, {
      headers: {
        Authorization: 'Bearer ' + assignment.classroom!.token!,
      },
      responseType: 'stream',
    }).subscribe(response => {
      this.importZipStream(response.data, assignment.id, solution.id, commit);
    }, error => {
      console.error(`Failed to index ${org}/${prefix}-${github}: ${error.message}`);
    });
  }

  private async createSolution(assignment: AssignmentDocument, repo: RepositoryInfo): Promise<Solution> {
    const githubName = repo.name.substring(assignment.classroom!.prefix!.length + 1);
    const commit = await this.getMainCommitSHA(repo, assignment.classroom!.token!);
    return {
      assignment: assignment._id,
      author: {
        name: '',
        email: '',
        github: githubName,
        studentId: '',
      },
      solution: '',
      commit,
      token: generateToken(),
      timestamp: new Date(repo.pushed_at),
    };
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
