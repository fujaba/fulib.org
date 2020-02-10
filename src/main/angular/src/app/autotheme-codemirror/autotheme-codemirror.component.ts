import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-autotheme-codemirror',
  templateUrl: './autotheme-codemirror.component.html',
  styleUrls: ['./autotheme-codemirror.component.scss']
})
export class AutothemeCodemirrorComponent implements OnInit {
  @Input() content: string;
  @Output() contentChange = new EventEmitter<string>();

  @Input() options: any;

  constructor() { }

  ngOnInit() {
  }

  setContent(value: string) {
    this.content = value;
    this.contentChange.emit(value);
  }
}
