import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Privacy, PrivacyService} from '../../services/privacy.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
})
export class PrivacyComponent implements OnInit {
  privacy: Privacy | null = null;

  constructor(
    private privacyService: PrivacyService,
    public route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.loadPrivacy();
  }

  loadPrivacy(): void {
    this.privacy = this.privacyService.privacy;
  }

  savePrivacy(): void {
    this.privacyService.privacy = this.privacy;
  }
}
