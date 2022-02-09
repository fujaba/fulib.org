import {Component, Input, ViewChild} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {ExportOptions} from '../model/ExportOptions';
import {GenerateResult} from '../model/GenerateResult';
import {WorkflowsService} from '../workflows.service';

@Component({
  selector: 'app-download-es',
  templateUrl: './download-es.component.html',
  styleUrls: ['./download-es.component.scss']
})
export class DownloadESComponent {
  @ViewChild('download') private downloadModal!: NgbActiveModal;

  @Input() public data!: GenerateResult;
  @Input() public cmContent!: string;

  public exportOptions: ExportOptions = {
    exportYaml: false,
    exportBoard: true,
    exportPages: false,
    exportObjects: false,
    exportClass: false,
    exportFxmls: false,
  };

  constructor(private modalService: NgbModal,
              private workflowsService: WorkflowsService) {
  }

  public open() {
    this.modalService.open(this.downloadModal, {centered: true}).result.then((reason) => {
      if (!reason) {
        this.workflowsService.downloadZip(this.cmContent, this.exportOptions);
      }
    }).catch(() => {
    });
  }

  selectAll() {
    this.exportOptions = {
      exportYaml: true,
      exportBoard: true,
      exportPages: true,
      exportObjects: true,
      exportClass: true,
      exportFxmls: true,
    };
  }

  deselectAll() {
    this.exportOptions = {
      exportYaml: false,
      exportBoard: false,
      exportPages: false,
      exportObjects: false,
      exportClass: false,
      exportFxmls: false,
    };
  }
}
