import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ModalComponent} from '../../../../shared/modal/modal.component';
import {ToastService} from '../../../../toast.service';
import {SolutionService} from '../../../services/solution.service';

@Component({
  selector: 'app-import-modal',
  templateUrl: './import-modal.component.html',
  styleUrls: ['./import-modal.component.scss'],
})
export class ImportModalComponent implements OnInit {
  mode = 'github';
  importing = false;
  files: File[] = [];

  constructor(
    private solutionService: SolutionService,
    private toastService: ToastService,
    public route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
  }

  import(modal: ModalComponent) {
    console.log(this.files);
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
