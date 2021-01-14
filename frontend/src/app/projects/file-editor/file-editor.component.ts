import {Component, Input, OnInit} from '@angular/core';
import {Container} from '../model/container';
import {FileEditor} from '../model/file-editor';

@Component({
  selector: 'app-file-editor',
  templateUrl: './file-editor.component.html',
  styleUrls: ['./file-editor.component.scss'],
})
export class FileEditorComponent implements OnInit {
  @Input() editor: FileEditor;

  constructor(
    public container: Container,
  ) {
  }

  ngOnInit(): void {
  }

}
