import {Component, OnInit} from '@angular/core';
import {Privacy, PrivacyService} from '../privacy.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
})
export class PrivacyComponent implements OnInit {
  privacy: Privacy;

  constructor(
    private privacyService: PrivacyService,
  ) {
  }

  ngOnInit(): void {
    this.loadPrivacy();
  }

  loadPrivacy(): void {
    this.privacy = this.privacyService.privacy ?? 'none';
  }

  savePrivacy(): void {
    this.privacyService.privacy = this.privacy;
  }
}
