import {Injectable} from '@nestjs/common';
import {Octokit} from "octokit";
import {environment} from "../environment";
import {IssueService} from "../issue/issue.service";
import {Cron, CronExpression} from "@nestjs/schedule";

@Injectable()
export class IssueFinderService {
  constructor(
    private readonly issueService: IssueService,
  ) {
  }

  @Cron(CronExpression.EVERY_HOUR)
  async findIssues() {
    const octokit = new Octokit({
      auth: environment.github.token,
    });
    const issues = await octokit.paginate('GET /search/issues', {
      q: `org:${environment.github.org} is:issue is:open fulibFeedback.assignment.id`,
    });
    for (const issue of issues) {
      if (!issue.repository_url.includes('Satiuz') && !issue.repository_url.includes('Giulcoo')) {
        continue;
      }
      const createdAt = new Date(issue.created_at);
      const start = issue.body!.lastIndexOf('```json\n{') + 8;
      const end = issue.body!.indexOf('}\n```', start) + 1;
      const json = issue.body!.substring(start, end);
      try {
        const data = JSON.parse(json);
        const assignment = data['fulibFeedback.assignment.id'];
        const solution = data['fulibFeedback.solution.id'];
        const id = issue.number;
        this.issueService.upsert({id, assignment, solution}, {
          $setOnInsert: {assignment, solution, id},
          $set: {createdAt, url: issue.url},
        });
      } catch (e) {
        // ignore
      }
    }
  }
}
