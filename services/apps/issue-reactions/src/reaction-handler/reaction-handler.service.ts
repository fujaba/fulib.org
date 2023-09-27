import {Injectable} from '@nestjs/common';
import {IssueService} from "../issue/issue.service";
import {Cron, CronExpression} from "@nestjs/schedule";
import {Octokit} from "octokit";
import {environment} from "../environment";

@Injectable()
export class ReactionHandlerService {
  constructor(
    private readonly issueService: IssueService,
  ) {
  }

  async onModuleInit() {
    return this.findReactions();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async findReactions() {
    const octokit = new Octokit({
      auth: environment.github.token,
    });
    const issues = await this.issueService.findAll({comment: {$exists: true}, reactions: {$exists: false}});
    for (const issue of issues) {
      const repo = issue.url.match(/repos\/[^/]+\/([^/]+)\//)?.[1]!;
      const reactions = await octokit.request('GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions', {
        owner: environment.github.org,
        repo,
        comment_id: issue.comment!,
      });
      if (!reactions.data.length) {
        continue;
      }

      await this.issueService.update(issue._id!, {
        reactions: Object.fromEntries(reactions.data.map(({content, created_at, user}) => [
          content,
          {
            createdAt: new Date(created_at),
            user: user?.login,
          },
        ])),
      });
      await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
        owner: environment.github.org,
        repo,
        issue_number: issue.id,
        body: `\
Danke für dein Feedback (${reactions.data.map(({content}) => `:${content}:`).join(' ')}).
Wir haben deine Antwort erhalten und werden uns darum kümmern.
`,
      });
    }
  }
}
