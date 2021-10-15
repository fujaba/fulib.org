import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {firstValueFrom} from 'rxjs';
import {AssignmentService} from '../assignment/assignment.service';
import {environment} from '../environment';
import {ReadSolutionDto} from '../solution/solution.dto';
import {Solution} from '../solution/solution.schema';
import {SolutionService} from '../solution/solution.service';
import {generateToken} from '../utils';

interface RepositoryInfo {
  name: string;
  pushed_at: string;
}

interface SearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: RepositoryInfo[];
}

@Injectable()
export class ClassroomService {
  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private http: HttpService,
  ) {
  }

  async import(id: string, auth: string): Promise<ReadSolutionDto[]> {
    const assignment = await this.assignmentService.findOne(id);
    if (!assignment || !assignment.classroom || !assignment.classroom.org || !assignment.classroom.prefix) {
      return [];
    }

    const githubToken = await this.getGithubToken(auth);

    const query = `org:${assignment.classroom.org} ${assignment.classroom.prefix} in:name`;
    const response = await firstValueFrom(this.http.get<SearchResult>('https://api.github.com/search/repositories', {
      params: {
        q: query,
        per_page: 100, // TODO paginate
      },
      headers: {
        Authorization: `Bearer ${githubToken}`,
      },
    }));
    const repositories = response.data.items;
    const result = await this.solutionService.bulkWrite(repositories.map(repo => {
      const githubName = repo.name.substring(assignment.classroom!.prefix!.length + 1);
      const solution: Solution = {
        assignment: id,
        author: {
          name: '',
          email: '',
          github: githubName,
          studentID: '',
        },
        solution: '',
        results: [],
        token: generateToken(),
        timestamp: new Date(repo.pushed_at),
      };
      return {
        updateOne: {
          filter: {'author.github': githubName},
          update: {$setOnInsert: solution},
          upsert: true,
        },
      };
    }));
    return this.solutionService.findAll({_id: {$in: Object.values(result.upsertedIds)}});
  }

  private async getGithubToken(auth: string): Promise<string> {
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

}
