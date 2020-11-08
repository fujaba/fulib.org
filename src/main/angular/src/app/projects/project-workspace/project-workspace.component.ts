import { Component, OnInit } from '@angular/core';
import {FileHandler} from '../file-tree/file-handler.interface';
import {File} from '../model/file.interface';

@Component({
  selector: 'app-project-workspace',
  templateUrl: './project-workspace.component.html',
  styleUrls: ['./project-workspace.component.scss']
})
export class ProjectWorkspaceComponent implements OnInit {
  exampleRoot: File = {
    name: '.',
    children: [
      {name: 'build.gradle'},
      {name: 'settings.gradle'},
      {
        name: 'src',
        children: [
          {
            name: 'main',
            children: [
              {
                name: 'java',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  };

  fileHandler: FileHandler = {
    open: (file: File) => {
      this.currentFile = file;
    },
  };

  currentFile: File;

  constructor() { }

  ngOnInit(): void {
  }

}
