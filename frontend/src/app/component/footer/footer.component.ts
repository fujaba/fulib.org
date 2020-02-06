import {Component, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  constructor(
    public readonly modalService: NgbModal,
  ) {
  }

  privacy: string;

  ngOnInit() {
  }

  savePrivacy() {
    console.log(this.privacy);
  }
}
