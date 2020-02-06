import {Component, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {PrivacyService, Privacy} from "../../privacy.service";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  constructor(
    public readonly modalService: NgbModal,
    private privacyService: PrivacyService,
  ) {
  }

  privacy: Privacy;

  ngOnInit(): void {
    this.loadPrivacy();
  }

  loadPrivacy(): void {
    this.privacy = this.privacyService.privacy || 'none';
  }

  savePrivacy(): void {
    this.privacyService.privacy = this.privacy;
  }
}
