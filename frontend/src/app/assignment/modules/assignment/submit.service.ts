import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {UserService} from '../../../user/user.service';
import {ReadAssignmentDto} from '../../model/assignment';
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
  _points: number;
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
    private userService: UserService,
    private http: HttpClient,
  ) {
  }

  async postIssueToGitHub(assignment: ReadAssignmentDto, solution: Solution, issue: IssueDto, githubToken: string): Promise<Issue> {
    const baseUrl = `https://api.github.com/repos/${assignment.classroom!.org}/${assignment.classroom!.prefix}-${solution.author.github}/issues`;
    const issues = await firstValueFrom(this.http.get<Issue[]>(baseUrl, {
      params: {
        state: 'all',
      },
      headers: {
        Authorization: `Bearer ${githubToken}`,
      },
    }));

    const existing = issues.find(i => i.body?.includes(assignment._id));
    if (existing) {
      return firstValueFrom(this.http.patch<Issue>(`${baseUrl}/${existing.number}`, issue, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
        },
      }));
    } else {
      return firstValueFrom(this.http.post<Issue>(baseUrl, issue, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
        },
      }));
    }
  }

  async createIssue(assignment: ReadAssignmentDto, solution: Solution): Promise<IssueDto> {
    const {total, sum, tasks} = await this.renderTasks(assignment, solution);
    const footer = this.renderFooter(assignment, solution);

    return {
      title: `${assignment.title} (${sum}/${total}P)`,
      body: `${tasks}\n\n${footer}`,
      _points: sum,
    };
  }

  private async renderTasks(assignment: ReadAssignmentDto, solution: Solution) {
    const evaluations = await firstValueFrom(this.solutionService.getEvaluations(assignment._id, solution._id!));
    const evaluationRecord: Record<string, Evaluation> = {};
    for (let evaluation of evaluations) {
      evaluationRecord[evaluation.task] = evaluation;
    }
    const points = this.taskService.createPointsCache(assignment.tasks, evaluationRecord);
    const total = this.taskService.sumPositivePoints(assignment.tasks);
    // Cannot grade negative points
    const sum = Math.max(assignment.tasks.reduce((a, c) => a + points[c._id], 0), 0);

    const renderTask = (task: Task, depth: number): string => {
      const point = points[task._id];
      const evaluation = evaluationRecord[task._id];
      if (!this.hasRelevantInfo(task, point, evaluation, depth)) {
        return '';
      }

      const snippets = evaluation ? this.renderSnippets(assignment, solution, evaluation.snippets) : '';
      const pointsString = task.points > 0 ? ` (${point}/${task.points}P)` : point ? ` (${point}P)` : '';
      if (task.children.length) {
        const headlinePrefix = '#'.repeat(depth + 2);
        const header = `${headlinePrefix} ${task.description}${pointsString}\n`;
        const remark = evaluation && evaluation.remark ? evaluation.remark + '\n' : '';
        const subTasks = evaluation ? '' : renderSubTasks(task.children, depth + 1);
        return header + remark + snippets + subTasks;
      } else {
        let desc = task.description;
        let remark = '';
        if (evaluation && evaluation.remark) {
          if (evaluation.remark.includes('\n')) {
            remark = '\n  ' + evaluation.remark.trim().replace(/\n/g, '\n  ') + '\n';
          } else {
            desc = task.description ? `${task.description}: ${evaluation.remark}` : evaluation.remark;
          }
        }

        return `- ${desc}${pointsString}\n${remark}${snippets}`;
      }
    };

    const renderSubTasks = (tasks: Task[], depth: number): string => tasks.map(task => renderTask(task, depth)).join('');

    const tasks = renderSubTasks(assignment.tasks, 0);
    return {total, sum, tasks};
  }

  private hasRelevantInfo(task: Task, points: number, evaluation: Evaluation | undefined, depth: number): boolean {
    return !!(
      evaluation?.remark
      || evaluation?.snippets.find(s => s.comment)
      // always show non-full points
      || points !== Math.max(task.points, 0)
      // always show top-level tasks (but not deductions)
      || depth === 0 && task.points > 0
      // always show tasks with subtasks
      || task.children.length
    );
  }

  private renderSnippets(assignment: ReadAssignmentDto, solution: Solution, snippets: Snippet[]) {
    return snippets.map(snippet => this.renderSnippet(assignment, solution, snippet)).join('');
  }

  private renderSnippet(assignment: ReadAssignmentDto, solution: Solution, snippet: Snippet) {
    const {org, prefix} = assignment.classroom ?? {};
    const {author: {github: username}, commit} = solution;
    if (org && prefix && username && commit) {
      const link = `https://github.com/${org}/${prefix}-${username}/blob/${commit}/${snippet.file}#L${snippet.from.line + 1}-L${snippet.to.line + 1}`;
      return `  * ${snippet.comment}: ${link}\n`;
    } else {
      const position = `${snippet.file}:${snippet.from.line + 1}:${snippet.from.character + 1}-${snippet.to.line + 1}:${snippet.to.character + 1}`;
      const dotIndex = snippet.file.lastIndexOf('.');
      const language = dotIndex >= 0 ? snippet.file.substring(dotIndex + 1) : '';
      return `  * ${snippet.comment}: ${position}:\n    \`\`\`${language}\n    ${snippet.code.replace(/\r?\n/g, '\n    ')}\n    \`\`\`\n`;
    }
  }

  private renderFooter(assignment: ReadAssignmentDto, solution: Solution) {
    const apiUrl = environment.assignmentsApiUrl;
    const apiServer = new URL(apiUrl, location.origin).origin;
    const timestamp = new Date();
    const settings = {
      'fulibFeedback.apiServer': apiServer,
      'fulibFeedback.assignment.id': assignment._id,
      'fulibFeedback.solution.id': solution._id,
      'fulibFeedback.solution.token': solution.token,
    };
    const commitInfo = solution.commit ? ` for commit ${solution.commit}` : '';
    return `\
---
<details>
<summary>View Evaluations in VSCode</summary>

Download the [fulibFeedback Extension](https://marketplace.visualstudio.com/items?itemName=fulib.fulibFeedback) \
and copy this to \`.vscode/settings.json\`:

\`\`\`json
${JSON.stringify(settings, null, 2)}
\`\`\`

</details>

<sub>*This issue was created with [fulib.org](https://fulib.org/assignments) on ${timestamp.toLocaleDateString()} at ${timestamp.toLocaleTimeString()}${commitInfo}.*</sub>
`;
  }
}
