import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {ToastService} from '../../toast.service';
import {ExportOptions} from '../model/ExportOptions';
import {PrivacyService} from '../../privacy.service';
import {WorkflowsService} from '../workflows.service';

@Component({
  selector: 'app-download-es',
  templateUrl: './download-es.component.html',
  styleUrls: ['./download-es.component.scss']
})
export class DownloadESComponent implements OnInit {
  private yamlContent!: string | null;

  public exportOptions: ExportOptions = {
    yaml: false,
    board: true,
    pages: false,
    objects: false,
    class: false,
    fxmls: false,
  };

  constructor(
    private modalService: NgbModal,
    public route: ActivatedRoute,
    private workflowsService: WorkflowsService,
    private privacyService: PrivacyService,
    private toastService: ToastService,
  ) {
  }

  ngOnInit() {
    this.yamlContent = this.privacyService.getStorage('workflows');
  }

  selectAll() {
    this.exportOptions = {
      yaml: true,
      board: true,
      pages: true,
      objects: true,
      class: true,
      fxmls: true,
    };
  }

  deselectAll() {
    this.exportOptions = {
      yaml: false,
      board: false,
      pages: false,
      objects: false,
      class: false,
      fxmls: false,
    };
  }

  download() {
    if (this.yamlContent) {
      this.workflowsService.downloadZip(this.yamlContent, this.exportOptions);
    } else {
      this.toastService.error('Download Files', 'Editor Content does not exist');
    }
  }
}
