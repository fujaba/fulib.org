import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ToastService} from '@mean-stream/ngbx';
import {importChildren} from "../import-routing.module";

@Component({
  selector: 'app-import-modal',
  templateUrl: './import-modal.component.html',
  styleUrls: ['./import-modal.component.scss'],
})
export class ImportModalComponent {
  importing = false;
  routes = importChildren;

  constructor(
    private toastService: ToastService,
    public route: ActivatedRoute,
  ) {
  }

  import(component: any) {
    this.importing = true;
    component.import().subscribe({
      next: results => {
        this.importing = false;
        if (typeof results === 'string') {
          this.toastService.success('Import', 'Successfully ran MOSS');
        } else if (results && typeof results === 'object' && 'length' in results) {
          this.toastService.success('Import', `Successfully imported ${results.length} solutions`);
        } else {
          this.toastService.success('Import', 'Successfully imported embeddings');
        }
      },
      error: error => {
        this.importing = false;
        this.toastService.error('Import', 'Failed to import solutions', error);
      },
    });
  }
}
