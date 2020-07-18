import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-collapse-button',
  templateUrl: './collapse-button.component.html',
  styleUrls: ['./collapse-button.component.scss']
})
export class CollapseButtonComponent implements OnInit {
  @Input() collapsed: boolean = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  constructor() {
  }

  ngOnInit() {
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
}
