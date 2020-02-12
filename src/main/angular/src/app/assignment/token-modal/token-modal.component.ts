import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-token-modal',
  templateUrl: './token-modal.component.html',
  styleUrls: ['./token-modal.component.scss']
})
export class TokenModalComponent implements OnInit {
  @ViewChild('tokenModal', {static: true}) tokenModal;

  @Output() submit = new EventEmitter<{ solutionToken: string; assignmentToken: string; }>();

  solutionToken: string;
  assignmentToken: string;

  constructor(
    private modalService: NgbModal,
  ) {
  }

  ngOnInit() {
  }

  open(): void {
    this.modalService.open(this.tokenModal, {ariaLabelledBy: 'tokenModalLabel'});
  }

  submitTokens(): void {
    this.submit.emit({
      solutionToken: this.solutionToken,
      assignmentToken: this.assignmentToken,
    });
  }
}
