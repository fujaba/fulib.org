import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PrivacyService} from '../../services/privacy.service';
import {ExportOptions} from '../model/ExportOptions';
import {WorkflowsService} from '../workflows.service';

@Component({
  selector: 'app-download-es',
  templateUrl: './download-es.component.html',
  styleUrls: ['./download-es.component.scss'],
  standalone: false,
})
export class DownloadESComponent implements OnInit {
  yamlContent?: string | null;
  localStorageAllowed = this.privacyService.allowLocalStorage;

  exportOptions: ExportOptions = {
    yaml: false,
    board: true,
    pages: false,
    objects: false,
    class: false,
    fxmls: false,
  };

  constructor(
    public route: ActivatedRoute,
    private workflowsService: WorkflowsService,
    private privacyService: PrivacyService,
  ) {
  }

  ngOnInit() {
    // TODO doesn't download examples if selected
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
    }
  }
}
