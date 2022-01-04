import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import axios, {Method} from 'axios';
import {createReadStream} from 'fs';
import {firstValueFrom} from 'rxjs';
import {Stream} from 'stream';
import {Entry as ZipEntry, Parse as unzip} from 'unzipper';
import {AssignmentDocument} from '../assignment/assignment.schema';
import {AssignmentService} from '../assignment/assignment.service';
import {environment} from '../environment';
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

const MAX_FILE_SIZE = 50 * 1024;

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
      if (entry.type !== 'File' || entry.extra.uncompressedSize > MAX_FILE_SIZE) {
        entry.autodrain();
        return;
      }
      entry.buffer().then(buffer => {
        const content = buffer.toString('utf-8');
        let index: number;
        const path = commit && (index = entry.path.indexOf(commit)) >= 0 ? entry.path.substring(index + commit.length + 1) : entry.path;
        this.searchService.addFile(assignment, solution, path, content);
      });
    });
  }

  async importSolutions(id: string, auth: string): Promise<ReadSolutionDto[]> {
    const assignment = await this.assignmentService.findOne(id);
    if (!assignment || !assignment.classroom || !assignment.classroom.org || !assignment.classroom.prefix) {
      return [];
    }

    const githubToken = await this.getGithubToken(auth);
    const ids = await this.importSolutions2(assignment, githubToken);
    return this.solutionService.findAll({_id: {$in: ids}});
  }

  async importSolutions2(assignment: AssignmentDocument, githubToken: string): Promise<string[]> {
    const query = `org:${assignment.classroom!.org} "${assignment.classroom!.prefix}-" in:name`;
    const repositories: RepositoryInfo[] = [];
    let total = Number.MAX_SAFE_INTEGER;
    for (let page = 1; repositories.length < total; page++) {
      const result = await this.github<SearchResult>('GET', 'https://api.github.com/search/repositories', githubToken, {
        q: query,
        per_page: 100,
        page,
      });
      total = result.total_count;
      repositories.push(...result.items);
    }

    const writes = await Promise.all(repositories.map(async repo => {
      const solution = await this.createSolution(assignment, repo, githubToken);
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

    if (assignment.classroom?.codeSearch) {
      const solutions = await this.solutionService.findAll({assignment: assignment.id});
      for (let solution of solutions) {
        this.addContentsToIndex(assignment, solution as SolutionDocument, githubToken);
      }
    }

    return Object.values(result.upsertedIds);
  }

  private addContentsToIndex(assignment: AssignmentDocument, solution: SolutionDocument, githubToken: string) {
    const {org, prefix} = assignment.classroom!;
    const {author: {github}, commit} = solution;
    if (!github) {
      return;
    }

    this.http.get<Stream>(`https://api.github.com/repos/${org}/${prefix}-${github}/zipball/${commit}`, {
      headers: {
        Authorization: 'Bearer ' + githubToken,
      },
      responseType: 'stream',
    }).subscribe(response => {
      this.importZipStream(response.data, assignment.id, solution.id, commit);
    }, error => {
      console.error(`Failed to index ${org}/${prefix}-${github}: ${error.message}`);
    });
  }

  private async createSolution(assignment: AssignmentDocument, repo: RepositoryInfo, token: string): Promise<Solution> {
    const githubName = repo.name.substring(assignment.classroom!.prefix!.length + 1);
    const commit = await this.getMainCommitSHA(repo, token);
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
      const branch = await this.github<{ commit: { sha: string }; }>('GET', url, token);
      return branch.commit.sha;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return undefined;
      }
      throw error;
    }
  }

  async getGithubToken(auth: string): Promise<string> {
    const {data} = await firstValueFrom(this.http.get<string>(`${environment.auth.issuer}/broker/github/token`, {
      headers: {
        Authorization: auth,
      },
      responseType: 'text',
    }));
    const parts = data.split('&');
    const paramName = 'access_token=';
    return parts.filter(s => s.startsWith(paramName))[0].substring(paramName.length);
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
