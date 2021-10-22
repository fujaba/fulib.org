import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {Method} from 'axios';
import {firstValueFrom} from 'rxjs';
import {AssignmentDocument, Task} from '../assignment/assignment.schema';
import {AssignmentService} from '../assignment/assignment.service';
import {environment} from '../environment';
import {Evaluation, Snippet} from '../evaluation/evaluation.schema';
import {EvaluationService} from '../evaluation/evaluation.service';
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
    private evaluationService: EvaluationService,
  ) {
  }

  async importSolutions(id: string, auth: string): Promise<ReadSolutionDto[]> {
    const assignment = await this.assignmentService.findOne(id);
    if (!assignment || !assignment.classroom || !assignment.classroom.org || !assignment.classroom.prefix) {
      return [];
    }

    const githubToken = await this.getGithubToken(auth);

    const query = `org:${assignment.classroom.org} ${assignment.classroom.prefix} in:name`;
    const {items} = await this.github<SearchResult>('GET', 'https://api.github.com/search/repositories', githubToken, {
      q: query,
      per_page: 100, // TODO paginate
    });
    const result = await this.solutionService.bulkWrite(items.map(repo => {
      const githubName = repo.name.substring(assignment.classroom!.prefix!.length + 1);
      const solution: Solution = {
        assignment: id,
        author: {
          name: '',
          email: '',
          github: githubName,
          studentId: '',
        },
        solution: '',
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

  async exportGithubIssue(assignmentId: string, solutionId: string, auth: string) {
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
    const issues = await this.github<Issue[]>('GET', baseUrl, githubToken, {
      state: 'all',
    });

    const existing = issues.find(i => i.body.includes(assignmentId));
    if (existing) {
      await this.github('PATCH', `${baseUrl}/${existing.number}`, githubToken, {}, issue);
    } else {
      await this.github('POST', baseUrl, githubToken, {}, issue);
    }
  }

  private async exportIssue(assignment: AssignmentDocument, solution: SolutionDocument): Promise<Omit<Issue, 'number'>> {
    const {total, sum, tasks} = await this.renderTasks(assignment, solution);
    const footer = this.renderFooter(assignment, solution);

    return {
      title: `${assignment.title} (${sum}/${total}P)`,
      body: `${tasks}\n\n${footer}`,
    };
  }

  private async renderTasks(assignment: AssignmentDocument, solution: SolutionDocument) {
    const evaluations = await this.evaluationService.findAll({
      assignment: assignment._id,
      solution: solution._id,
    });
    const evaluationRecord: Record<string, Evaluation> = {};
    for (let evaluation of evaluations) {
      evaluationRecord[evaluation.task] = evaluation;
    }
    const points = this.assignmentService.createPointsCache(assignment.tasks, evaluationRecord);
    const total = assignment.tasks.reduce((a, c) => c.points > 0 ? a + c.points : 0, 0);
    const sum = assignment.tasks.reduce((a, c) => a + points[c._id], 0);

    const renderTask = (task: Task, depth: number): string => {
      const point = points[task._id];
      const evaluation = evaluationRecord[task._id];
      const snippets = evaluation ? this.renderSnippets(assignment, solution, evaluation.snippets) : '';
      if (task.points >= 0) {
        const headlinePrefix = '#'.repeat(depth + 2);
        const subTasks = renderSubTasks(task.children, depth + 1);
        const header = `${headlinePrefix} ${task.description} (${point}/${task.points}P)`;
        return [header, evaluation?.remark, snippets, subTasks].filter(x => x).join('\n');
      }
      if (point === 0) {
        // do not render deductions that were not given
        return '';
      }
      return `- ${task.description}: ${evaluation.remark} (${point}P)\n${snippets}`;
    };

    const renderSubTasks = (tasks: Task[], depth: number): string => tasks.map(task => renderTask(task, depth)).join('\n');

    const tasks = renderSubTasks(assignment.tasks, 0);
    return {total, sum, tasks};
  }

  private renderSnippets(assignment: AssignmentDocument, solution: SolutionDocument, snippets: Snippet[]) {
    return snippets.map(snippet => this.renderSnippet(assignment, solution, snippet)).join('\n');
  }

  private renderSnippet(assignment: AssignmentDocument, solution: SolutionDocument, snippet: Snippet) {
    const link = `https://github.com/${assignment.classroom!.org}/${assignment.classroom!.prefix}-${solution.author.github}/blob/${solution.solution}/${snippet.file}#L${snippet.from.line + 1}-L${snippet.to.line + 1}`;
    return `  * ${snippet.comment}: ${link}`;
  }

  private renderFooter(assignment: AssignmentDocument, solution: SolutionDocument) {
    const timestamp = new Date();
    const settings = {
      'fulibFeedback.apiServer': 'https://fulib.org',
      'fulibFeedback.assignment.id': assignment._id,
      'fulibFeedback.solution.id': solution._id,
      'fulibFeedback.solution.token': solution.token,
    };
    return `\
---
<details>
<summary>View Evaluations in VSCode</summary>

Copy this to \`.vscode/settings.json\`:
\`\`\`json
${JSON.stringify(settings, null, 2)}
\`\`\`

</details>

<sub>*This issue was created with [fulib.org](https://fulib.org/assignments) on ${timestamp.toLocaleDateString()} at ${timestamp.toLocaleTimeString()}.*</sub>
`;
  }
}
