import {Component} from '@angular/core';
import {ImportSolution} from "../../../model/solution";
import {SolutionService} from "../../../services/solution.service";
import {ActivatedRoute} from "@angular/router";
import {ToastService} from '@mean-stream/ngbx';
import {ImportTab} from '../import-tab.interface';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-import-github',
  templateUrl: './import-github.component.html',
  styleUrls: ['./import-github.component.scss'],
  standalone: false,
})
export class ImportGithubComponent implements ImportTab {
  checkedUsernames: Partial<Record<string, boolean>> = {};
  previewSolutions?: ImportSolution[];
  reimport = false;

  constructor(
    private solutionService: SolutionService,
    private route: ActivatedRoute,
    private toastService: ToastService,
  ) {
  }

  previewGitHubImport() {
    this.solutionService.previewImport(this.route.snapshot.params.aid).subscribe({
      next: solutions => this.previewSolutions = solutions,
      error: error => {
        this.toastService.error('Load Students', 'Failed to load Students from GitHub', error);
        this.previewSolutions = [];
      },
    });
  }

  import() {
    const assignmentId = this.route.snapshot.params.aid;
    const usernames = Object.keys(this.checkedUsernames).filter(username => this.checkedUsernames[username]);
    return this.solutionService.import(assignmentId, undefined, usernames, this.reimport).pipe(
      map(results => `Successfully imported ${results.length} solutions from GitHub`),
    );
  }
}
