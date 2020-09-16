import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {Privacy, PrivacyService} from '../privacy.service';
import {ChangelogService, Versions} from '../changelog.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, AfterViewInit {
  constructor(
    private privacyService: PrivacyService,
    private changelogService: ChangelogService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  menuCollapsed = true;

  repos?: (keyof Versions)[];
  versions?: Versions;

  ngOnInit(): void {
    this.repos = this.changelogService.repos;
    this.versions = this.changelogService.currentVersions;
  }

  ngAfterViewInit(): void {
    if (this.privacyService.privacy === null) {
      this.router.navigate([{outlets: {modal: 'privacy'}}], {relativeTo: this.route});
    }
  }
}
