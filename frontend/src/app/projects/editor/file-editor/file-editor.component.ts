import {Component, Input, OnInit} from '@angular/core';
import {Container} from '../../model/container';
import {FileEditor} from '../../model/file-editor';
import {ProjectManager} from '../../project.manager';

@Component({
  selector: 'app-file-editor',
  templateUrl: './file-editor.component.html',
  styleUrls: ['./file-editor.component.scss'],
})
export class FileEditorComponent implements OnInit {
  @Input() editor: FileEditor;

  container: Container;

  constructor(
    private projectManager: ProjectManager,
  ) {
  }

  ngOnInit(): void {
    this.container = this.projectManager.container;
  }

}
