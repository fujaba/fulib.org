import {Component} from '@angular/core';
import {ImportSolution} from "../../../model/solution";
import {SolutionService} from "../../../services/solution.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-import-github',
  templateUrl: './import-github.component.html',
  styleUrls: ['./import-github.component.scss']
})
export class ImportGithubComponent {
  checkedUsernames: Partial<Record<string, boolean>> = {};
  previewSolutions: ImportSolution[];

  constructor(
    private solutionService: SolutionService,
    private route: ActivatedRoute,
  ) {
  }

  previewGitHubImport() {
    this.solutionService.previewImport(this.route.snapshot.params.aid).subscribe(solutions => this.previewSolutions = solutions);
  }

  import() {
    const assignmentId = this.route.snapshot.params.aid;
    const usernames = Object.keys(this.checkedUsernames).filter(username => this.checkedUsernames[username]);
    return this.solutionService.import(assignmentId, undefined, usernames);
  }
}
