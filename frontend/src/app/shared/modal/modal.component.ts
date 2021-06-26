import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {NavigationExtras, Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal',
  exportAs: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() size?: 'sm' | 'lg' | 'xl' | string;
  @Input() scrollable?: boolean;
  @Input() locked?: boolean;

  @Input() back: any[] = [{outlets: {modal: null}}];
  @Input() backOptions?: NavigationExtras;

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
      scrollable: this.scrollable,
      beforeDismiss: () => !this.locked,
    });

    const handler = result => {
      this.router.navigate(this.back, this.backOptions);
      this.modalClose.next(result);
    };
    this.openModal.result.then(handler, handler);
  }

  ngOnDestroy(): void {
    this.openModal?.close();
  }

  close(event?: any): void {
    this.openModal?.close(event);
  }
}
