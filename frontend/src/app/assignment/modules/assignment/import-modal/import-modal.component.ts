import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ModalComponent, ToastService} from '@mean-stream/ngbx';
import {SolutionService} from '../../../services/solution.service';

@Component({
  selector: 'app-import-modal',
  templateUrl: './import-modal.component.html',
  styleUrls: ['./import-modal.component.scss'],
})
export class ImportModalComponent {
  mode = 'github';
  importing = false;
  files: File[] = [];

  constructor(
    private solutionService: SolutionService,
    private toastService: ToastService,
    public route: ActivatedRoute,
  ) {
  }

  import(modal: ModalComponent) {
    const assignmentId = this.route.snapshot.params.aid;
    this.importing = true;
    this.solutionService.import(assignmentId, this.files).subscribe(results => {
      this.importing = false;
      this.toastService.success('Import', `Successfully imported ${results.length} solutions`);
      modal.close();
    }, error => {
      this.importing = false;
      this.toastService.error('Import', 'Failed to import solutions', error);
    });
  }

  setFiles(files: FileList) {
    this.files = Array.from(files);
  }
}
