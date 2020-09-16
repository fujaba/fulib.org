import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal',
  exportAs: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
  @Input() size?: 'sm' | 'lg' | 'xl' | string;

  @ViewChild('modal', {static: true}) modal;
  openModal?: NgbModalRef;

  @Output() modalClose = new EventEmitter<any>();

  constructor(
    private modalService: NgbModal,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.openModal = this.modalService.open(this.modal, {
      ariaLabelledBy: 'title',
      size: this.size,
    });

    const handler = result => {
      this.router.navigate([{outlets: {modal: null}}]);
      this.modalClose.next(result);
    };
    this.openModal.result.then(handler, handler);
  }

  close(event?: any): void {
    this.openModal?.close(event);
  }
}
