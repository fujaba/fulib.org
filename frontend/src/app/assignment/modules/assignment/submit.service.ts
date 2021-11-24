import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import Assignment from '../../model/assignment';
import {Evaluation, Snippet} from '../../model/evaluation';
import Solution from '../../model/solution';
import Task from '../../model/task';
import {AssignmentService} from '../../services/assignment.service';
import {SolutionService} from '../../services/solution.service';
import {TaskService} from '../../services/task.service';

export interface Issue {
  number: number;
  title: string;
  body: string;
}

export type IssueDto = Omit<Issue, 'number'>;

@Injectable({
  providedIn: 'root',
})
export class SubmitService {

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private taskService: TaskService,
    private http: HttpClient,
  ) {
  }

  async getGitHubToken(): Promise<string | undefined> {
    try {
      const data = await this.http.get(`${environment.auth.url}/realms/${environment.auth.realm}/broker/github/token`, {
        responseType: 'text',
      }).toPromise();
      const parts = data.split('&');
      const paramName = 'access_token=';
      return parts.filter(s => s.startsWith(paramName))[0]?.substring(paramName.length);
    } catch (error) {
      return undefined;
    }
  }

  async postIssueToGitHub(assignment: Assignment, solution: Solution, issue: IssueDto, githubToken: string): Promise<Issue> {
    const baseUrl = `https://api.github.com/repos/${assignment.classroom!.org}/${assignment.classroom!.prefix}-${solution.author.github}/issues`;
    const issues = await this.http.get<Issue[]>(baseUrl, {
      params: {
        state: 'all',
      },
      headers: {
        Authorization: `Bearer ${githubToken}`,
      },
    }).toPromise();

    const existing = issues.find(i => i.body?.includes(assignment._id!));
    if (existing) {
      return this.http.patch<Issue>(`${baseUrl}/${existing.number}`, issue, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
        },
      }).toPromise();
    } else {
      return this.http.post<Issue>(baseUrl, issue, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
        },
      }).toPromise();
    }
  }

  async createIssue(assignment: Assignment, solution: Solution): Promise<IssueDto> {
    const {total, sum, tasks} = await this.renderTasks(assignment, solution);
    const footer = this.renderFooter(assignment, solution);

    return {
      title: `${assignment.title} (${sum}/${total}P)`,
      body: `${tasks}\n\n${footer}`,
    };
  }

  private async renderTasks(assignment: Assignment, solution: Solution) {
    const evaluations = await this.solutionService.getEvaluations(assignment._id!, solution._id!).toPromise();
    const evaluationRecord: Record<string, Evaluation> = {};
    for (let evaluation of evaluations) {
      evaluationRecord[evaluation.task] = evaluation;
    }
    const points = this.taskService.createPointsCache(assignment.tasks, evaluationRecord);
    const total = assignment.tasks.reduce((a, c) => c.points > 0 ? a + c.points : 0, 0);
    const sum = assignment.tasks.reduce((a, c) => a + points[c._id], 0);

    const renderTask = (task: Task, depth: number): string => {
      const point = points[task._id];
      const evaluation = evaluationRecord[task._id];
      if (task.points < 0 && point === 0 && !evaluation) {
        // do not render deductions that were not given
        return '';
      }

      const snippets = evaluation ? this.renderSnippets(assignment, solution, evaluation.snippets) : '';
      if (task.points >= 0) {
        const headlinePrefix = '#'.repeat(depth + 2);
        const header = `${headlinePrefix} ${task.description} (${point}/${task.points}P)\n`;
        const remark = evaluation && evaluation.remark ? evaluation.remark + '\n' : '';
        const subTasks = renderSubTasks(task.children, depth + 1);
        return header + remark + snippets + subTasks;
      } else {
        const desc = [task.description, evaluation?.remark].filter(x => x).join(': ');
        return `- ${desc} (${point}P)\n${snippets}`;
      }
    };

    const renderSubTasks = (tasks: Task[], depth: number): string => tasks.map(task => renderTask(task, depth)).join('');

    const tasks = renderSubTasks(assignment.tasks, 0);
    return {total, sum, tasks};
  }

  private renderSnippets(assignment: Assignment, solution: Solution, snippets: Snippet[]) {
    return snippets.map(snippet => this.renderSnippet(assignment, solution, snippet)).join('');
  }

  private renderSnippet(assignment: Assignment, solution: Solution, snippet: Snippet) {
    const link = `https://github.com/${assignment.classroom!.org}/${assignment.classroom!.prefix}-${solution.author.github}/blob/${solution.commit}/${snippet.file}#L${snippet.from.line + 1}-L${snippet.to.line + 1}`;
    return `  * ${snippet.comment}: ${link}\n`;
  }

  private renderFooter(assignment: Assignment, solution: Solution) {
    const apiUrl = environment.assignmentsApiUrl;
    const apiServer = new URL(apiUrl, location.origin).origin;
    const timestamp = new Date();
    const settings = {
      'fulibFeedback.apiServer': apiServer,
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

<sub>*This issue was created with [fulib.org](https://fulib.org/assignments) on ${timestamp.toLocaleDateString()} at ${timestamp.toLocaleTimeString()} for commit ${solution.commit}.*</sub>
`;
  }
}
