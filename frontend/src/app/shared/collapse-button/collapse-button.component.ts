import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgbTooltip} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-collapse-button',
  templateUrl: './collapse-button.component.html',
  styleUrls: ['./collapse-button.component.scss'],
  imports: [NgbTooltip],
})
export class CollapseButtonComponent {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  toggle(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
}
