import {Component, Input, OnInit, TemplateRef} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {
  @Input() title: string;

  constructor(
    private modal: NgbModal,
  ) {
  }

  ngOnInit(): void {
  }

  open(content: TemplateRef<any>): void {
    this.modal.open(content, {ariaLabelledBy: 'modal-basic-title', size: 'xl'});
  }
}
