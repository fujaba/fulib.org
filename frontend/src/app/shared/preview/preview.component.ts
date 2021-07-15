import {Component, Input, TemplateRef} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent {
  @Input() title: string;

  constructor(
    private modal: NgbModal,
  ) {
  }

  open(content: TemplateRef<any>): void {
    this.modal.open(content, {ariaLabelledBy: 'diagram-modal-title', size: 'xl', scrollable: true});
  }
}
