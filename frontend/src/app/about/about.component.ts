import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  license = 'Loading...';
  thirdPartyLicenses = 'Loading...';

  constructor(
    private http: HttpClient,
  ) {
  }

  ngOnInit(): void {
    this.http.get('/LICENSE.md', {responseType: 'text'}).subscribe(license => {
      return this.license = license;
    });

    this.http.get('/3rdpartylicenses.txt', {responseType: 'text'}).subscribe(thirdPartyLicenses => {
      return this.thirdPartyLicenses = thirdPartyLicenses;
    });
  }
}
