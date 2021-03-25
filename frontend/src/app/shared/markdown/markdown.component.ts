import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-markdown',
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.scss'],
})
export class MarkdownComponent implements OnInit {
  @Input() html: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
