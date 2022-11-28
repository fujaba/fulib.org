import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-masked-input',
  templateUrl: './masked-input.component.html',
  styleUrls: ['./masked-input.component.scss']
})
export class MaskedInputComponent implements OnInit {
  @Input() type = 'text';

  @Input() value: any;
  @Output() valueChange = new EventEmitter<string>();

  @Input() placeholder = '';

  constructor() { }

  ngOnInit(): void {
  }

}
