import {Component, OnInit} from '@angular/core';

declare var $: any;

@Component({
  selector: 'app-config-modal',
  templateUrl: './config-modal.component.html',
  styleUrls: ['./config-modal.component.scss']
})
export class ConfigModalComponent implements OnInit {
  packageName: string;
  projectName: any;
  version: any;
  scenarioFileName: any;

  constructor() {
  }

  ngOnInit() {
  }

  open(): void {
    $('#configModal').modal('show');
  }

  private save(): void {

  }

  private downloadProjectZip(): void {

  }
}
