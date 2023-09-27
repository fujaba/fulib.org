import {Injectable} from '@nestjs/common';
import {IssueService} from "../issue/issue.service";
import {Octokit} from "octokit";
import {environment} from "../environment";
import {OnEvent} from "@nestjs/event-emitter";
import {Issue} from "../issue/issue.schema";

@Injectable()
export class CommentPosterService {
  constructor(
    private readonly issueService: IssueService,
  ) {
  }

  @OnEvent('assignments.*.solutions.*.issues.*.created')
  async commentIssues(issue: Issue) {
    const octokit = new Octokit({
      auth: environment.github.token,
    });

    const body = `\
Bitte reagiere auf diese Nachricht mit :+1: oder :-1:, um zu zeigen, ob du mit der Bewertung einverstanden bist.
- :+1: bedeutet, dass du mit der Bewertung einverstanden bist.
- :-1: bedeutet, dass du mit der Bewertung nicht einverstanden bist.

Bitte reagiere auf diese Nachricht mit :rocket: oder :confused:, um zu zeigen, ob die Bewertung hilfreich ist.
Helfen dir die Kommentare zu den Fehlern, diese zu beheben?
- :rocket: bedeutet, dass die Kommentare hilfreich sind.
- :confused: bedeutet, dass die Kommentare nicht hilfreich sind.

Wenn du Fragen hast, kannst du sie hier stellen.
    `;

    const repo = issue.url.match(/repos\/[^/]+\/([^/]+)\//)?.[1]!;
    const comment = await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
      owner: environment.github.org,
      repo,
      issue_number: issue.id,
      body,
    });
    await this.issueService.update(issue._id, {
      comment: comment.data.id,
    });
  }
}
