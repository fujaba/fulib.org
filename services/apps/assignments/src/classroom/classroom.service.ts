import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';
import {Method} from 'axios';
import {firstValueFrom} from 'rxjs';
import {Stream} from 'stream';
import {extract} from 'tar-stream';
import {AssignmentDocument} from '../assignment/assignment.schema';
import {AssignmentService} from '../assignment/assignment.service';
import {environment} from '../environment';
import {ReadSolutionDto} from '../solution/solution.dto';
import {Solution} from '../solution/solution.schema';
import {SolutionService} from '../solution/solution.service';
import {generateToken} from '../utils';

import gunzip = require('gunzip-maybe');

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
    private http: HttpService,
    private elasticsearchService: ElasticsearchService,
  ) {
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

    for (let i = 0; i < repositories.length; i++) {
      const solution = result.upsertedIds[i];
      if (!solution) {
        continue;
      }

      const repo = repositories[i];
      this.addContentsToIndex(repo, assignment.id, solution.toString(), githubToken);
    }

    return Object.values(result.upsertedIds);
  }

  private addContentsToIndex(repo: RepositoryInfo, assignment: string, solution: string, githubToken: string) {
    this.http.get<Stream>(`https://api.github.com/repos/${repo.full_name}/tarball/${repo.default_branch}`, {
      headers: {
        Authorization: 'Bearer ' + githubToken,
      },
      responseType: 'stream',
    }).subscribe(response => {
      const tar = extract();
      tar.on('entry', (header, stream, next) => {
        if (header.type !== 'file' || header.size && header.size > MAX_FILE_SIZE) {
          stream.on('end', () => next());
          stream.resume();
          return;
        }
        const filename = header.name.substring(header.name.indexOf('/') + 1);
        let content = '';
        stream.on('data', data => content += data.toString('utf8'));
        stream.on('end', () => {
          this.addToIndex(assignment, solution, filename, content);
          next();
        });
      });
      response.data.pipe(gunzip()).pipe(tar);
    });
  }

  private addToIndex(assignment: string, solution: string, file: string, content: string) {
    this.elasticsearchService.index({
      index: 'files',
      id: `${assignment}/${solution}/${file}`,
      body: {
        assignment,
        solution,
        file,
        content,
      },
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

  private async getMainCommitSHA(repo: RepositoryInfo, token: string): Promise<string> {
    const url = `https://api.github.com/repos/${repo.full_name}/branches/${repo.default_branch}`;
    const branch = await this.github<{ commit: { sha: string }; }>('GET', url, token);
    return branch.commit.sha;
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
