import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-grade-modal',
  templateUrl: './grade-modal.component.html',
  styleUrls: ['./grade-modal.component.scss']
})
export class GradeModalComponent implements OnInit {
  @ViewChild('gradeModal', {static: true}) gradeModal;

  name: string;
  points: number;
  note: string;

  constructor(
    private modalService: NgbModal,
  ) {
  }

  ngOnInit() {
  }

  open(): void {
    this.modalService.open(this.gradeModal, {ariaLabelledBy: 'gradeModalLabel'});
  }

  submit() {
    // TODO
  }
}
