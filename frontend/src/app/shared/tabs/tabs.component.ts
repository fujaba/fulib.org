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
  @Input() fallback: TemplateRef<any> | null = null;
  @Output() create = new EventEmitter<void>();

  @Input() tabs: E[] = [];
  @Output() tabsChange = new EventEmitter<E[]>();

  @Input() current?: E;
  @Output() currentChange = new EventEmitter<E | undefined>();

  constructor() {
  }

  ngOnInit() {
  }

  private setCurrent(current: E | undefined) {
    this.current = current;
    this.currentChange.next(current);
  }

  private emitChange(): void {
    this.tabsChange.next(this.tabs);
  }

  open(editor: E) {
    if (this.tabs.indexOf(editor) < 0) {
      this.tabs.push(editor);
      this.emitChange();
    }
    this.setCurrent(editor);
  }

  close(editor: E) {
    const index = this.tabs.indexOf(editor);
    if (index >= 0) {
      this.tabs.splice(index, 1);
      this.emitChange();
      this.current = this.tabs[index] || this.tabs[index - 1];
    }
    if (editor === this.current) {
      this.setCurrent(undefined);
    }
  }

  closeOthers(editor: E) {
    this.setCurrent(editor);
    this.tabs = [editor];
    this.emitChange();
  }

  closeAll() {
    this.setCurrent(undefined);
    this.tabs.length = 0;
    this.emitChange();
  }

  closeLeftOf(editor: E) {
    const index = this.tabs.indexOf(editor);
    this.tabs.splice(0, index);
    this.emitChange();
    this.replaceOpenEditorIfNecessary(editor);
  }

  closeRightOf(editor: E) {
    const index = this.tabs.indexOf(editor);
    this.tabs.splice(index + 1);
    this.emitChange();
    this.replaceOpenEditorIfNecessary(editor);
  }

  private replaceOpenEditorIfNecessary(editor: E) {
    if (this.current && !this.tabs.includes(this.current)) {
      this.setCurrent(editor);
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
