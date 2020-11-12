import {Component, Input, OnInit} from '@angular/core';
import {File} from '../model/file';

@Component({
  selector: 'app-file-revisions',
  templateUrl: './file-revisions.component.html',
  styleUrls: ['./file-revisions.component.scss'],
})
export class FileRevisionsComponent implements OnInit {
  @Input() file: File;

  constructor() {
  }

  ngOnInit(): void {
  }

}
