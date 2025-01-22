import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-masked-input',
  templateUrl: './masked-input.component.html',
  styleUrls: ['./masked-input.component.scss'],
  standalone: false,
})
export class MaskedInputComponent {
  @Input() type = 'text';

  @Input() value: any;
  @Output() valueChange = new EventEmitter<string>();

  @Input() placeholder = '';
}
