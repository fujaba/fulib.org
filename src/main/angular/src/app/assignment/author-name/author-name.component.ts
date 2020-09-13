import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-author-name',
  templateUrl: './author-name.component.html',
  styleUrls: ['./author-name.component.scss'],
})
export class AuthorNameComponent implements OnInit {
  @Input() name: string;
  @Input() email: string;

  constructor() {
  }

  ngOnInit() {
  }

}
