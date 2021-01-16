import {Component, EventEmitter, Input, OnInit, Output, TemplateRef} from '@angular/core';
import {NgbDropdown} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent<E> implements OnInit {
  @Input() header: TemplateRef<any>;
  @Input() content: TemplateRef<any>;
  @Output() create = new EventEmitter<void>();

  @Input() tabs: E[] = [];

  current?: E;

  constructor() {
  }

  ngOnInit() {
  }

  open(editor: E) {
    this.current = editor;
  }

  close(editor: E) {
    const index = this.tabs.indexOf(editor);
    if (index >= 0) {
      this.tabs.splice(index, 1);
      this.current = this.tabs[index] || this.tabs[index - 1];
    }
    if (editor === this.current) {
      this.current = undefined;
    }
  }

  closeOthers(editor: E) {
    this.current = editor;
    this.tabs = [editor];
  }

  closeAll() {
    this.current = undefined;
    this.tabs.length = 0;
  }

  closeLeftOf(editor: E) {
    const index = this.tabs.indexOf(editor);
    this.tabs.splice(0, index);
    this.replaceOpenEditorIfNecessary(editor);
  }

  closeRightOf(editor: E) {
    const index = this.tabs.indexOf(editor);
    this.tabs.splice(index + 1);
    this.replaceOpenEditorIfNecessary(editor);
  }

  private replaceOpenEditorIfNecessary(editor: E) {
    if (this.current && !this.tabs.includes(this.current)) {
      this.current = editor;
    }
  }

  auxClick(event: MouseEvent, editor: E) {
    if (event.button !== 1) {
      return;
    }
    this.close(editor);
    event.preventDefault();
  }

  openContextMenu(event: MouseEvent, editor: E, dropdown: NgbDropdown) {
    if (event.button !== 2 || event.shiftKey || dropdown.isOpen()) {
      return;
    }

    dropdown.open();
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
