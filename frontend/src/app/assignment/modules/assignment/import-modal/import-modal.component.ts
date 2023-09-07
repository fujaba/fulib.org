import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ToastService} from '@mean-stream/ngbx';
import {SolutionService} from '../../../services/solution.service';
import {EstimatedCosts, ImportSolution} from "../../../model/solution";
import {EMPTY, Observable} from "rxjs";
import {AssignmentService} from "../../../services/assignment.service";

@Component({
  selector: 'app-import-modal',
  templateUrl: './import-modal.component.html',
  styleUrls: ['./import-modal.component.scss'],
})
export class ImportModalComponent {
  mode = 'github';
  importing = false;
  files: File[] = [];

  checkedUsernames: Partial<Record<string, boolean>> = {};
  previewSolutions: ImportSolution[];
  estimatedCosts?: EstimatedCosts;
  finalCosts?: EstimatedCosts;
  mossResult?: string;

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private toastService: ToastService,
    public route: ActivatedRoute,
  ) {
  }

  import() {
    this.importing = true;
    this.getImporter().subscribe(results => {
      this.importing = false;
      if (typeof results === 'string') {
        this.toastService.success('Import', 'Successfully ran MOSS');
        this.mossResult = results;
        return;
      } else if ('length' in results) {
        this.toastService.success('Import', `Successfully imported ${results.length} solutions`);
      } else {
        this.toastService.success('Import', 'Successfully imported embeddings');
        this.finalCosts = results;
      }
    }, error => {
      this.importing = false;
      this.toastService.error('Import', 'Failed to import solutions', error);
    });
  }

  private getImporter(): Observable<EstimatedCosts | ImportSolution[] | string> {
    const assignmentId = this.route.snapshot.params.aid;

    switch (this.mode) {
      case 'github':
        const usernames = Object.keys(this.checkedUsernames).filter(username => this.checkedUsernames[username]);
        return this.solutionService.import(assignmentId, undefined, usernames);
      case 'files':
        return this.solutionService.import(assignmentId, this.files);
      case 'embeddings':
        return this.solutionService.importEmbeddings(assignmentId);
      case 'moss':
        return this.assignmentService.moss(assignmentId);
      default:
        return EMPTY;
    }
  }

  setFiles(files: FileList) {
    this.files = Array.from(files);
  }

  previewGitHubImport() {
    this.solutionService.previewImport(this.route.snapshot.params.aid).subscribe(solutions => this.previewSolutions = solutions);
  }

  estimateCosts() {
    this.solutionService.estimateCosts(this.route.snapshot.params.aid).subscribe(costs => this.estimatedCosts = costs);
  }
}
