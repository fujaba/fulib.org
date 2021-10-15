import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {firstValueFrom} from 'rxjs';
import {Assignment, AssignmentDocument} from '../assignment/assignment.schema';
import {AssignmentService} from '../assignment/assignment.service';
import {environment} from '../environment';
import {ReadSolutionDto} from '../solution/solution.dto';
import {Solution, SolutionDocument} from '../solution/solution.schema';
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

interface Issue {
  number: number;
  title: string;
  body: string;
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

  async export(assignmentId: string, solutionId: string, auth: string) {
    const assignment = await this.assignmentService.findOne(assignmentId);
    if (!assignment || !assignment.classroom || !assignment.classroom.org || !assignment.classroom.prefix) {
      return;
    }

    const solution = await this.solutionService.findOne(solutionId);
    if (!solution || !solution.author.github) {
      return;
    }

    const githubToken = await this.getGithubToken(auth);
    const issue = await this.exportIssue(assignment, solution);

    const baseUrl = `https://api.github.com/repos/${assignment.classroom.org}/${assignment.classroom.prefix}-${solution.author.github}/issues`;
    const {data: issues} = await firstValueFrom(this.http.get<Issue[]>(baseUrl, {
      params: {
        state: 'all',
      },
      headers: {
        Authorization: `Bearer ${githubToken}`,
      },
    }));

    const existing = issues.find(i => i.body.includes(assignmentId));
    if (existing) {
      await firstValueFrom(this.http.patch(baseUrl + '/' + existing.number, issue, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
        },
      }));
    } else {
      await firstValueFrom(this.http.post(baseUrl, issue, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
        },
      }));
    }
  }

  private async exportIssue(assignment: AssignmentDocument, solution: SolutionDocument): Promise<Omit<Issue, 'number'>> {
    const timestamp = new Date().toISOString();
    return {
      title: assignment.title,
      body: `
<sub>*This issue was created with fulib.org at \`${timestamp}\`.*</sub>
<!--Metadata:{
"assignment": "${assignment._id}",
"solution": "${solution._id}",
"timestamp": "${timestamp}"
}-->
`,
    };
  }
}
