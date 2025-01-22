import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  standalone: false,
})
export class PreviewComponent implements OnInit {
  url!: string;
  title!: string;

  constructor(
    private modal: NgbModal,
    public route: ActivatedRoute,
    private titleService: Title,
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(({url}) => {
      const {pathname} = new URL(url, location.origin);
      const fileName = pathname.substring(pathname.lastIndexOf('/') + 1);
      this.url = url;
      this.title = fileName;
      this.titleService.setTitle(fileName + ' - Preview - fulib.org');
    });
  }
}
