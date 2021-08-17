import {Component, OnInit} from '@angular/core';
import {EditorService} from '../../services/editor.service';
import {FileEditor} from '../../model/file-editor';

@Component({
  selector: 'app-split-panel',
  templateUrl: './split-panel.component.html',
  styleUrls: ['./split-panel.component.scss'],
})
export class SplitPanelComponent implements OnInit {

  editors: FileEditor[][];
  active = 0;

  constructor(
    private editorService: EditorService,
  ) {
  }

  ngOnInit() {
    this.editorService.loadEditors();
    this.editors = this.editorService.editors;
    if (this.editors.length === 0) {
      this.addTab();
    }
  }

  addTab() {
    this.editors.push([]);
    this.editorService.saveEditors();
  }

  closeTab(index: number) {
    this.editors.splice(index, 1);
    this.editorService.saveEditors();
  }
}
