import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbTooltip} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-masked-input',
  templateUrl: './masked-input.component.html',
  styleUrls: ['./masked-input.component.scss'],
  imports: [NgbTooltip, FormsModule],
})
export class MaskedInputComponent {
  @Input() type = 'text';

  @Input() value: any;
  @Output() valueChange = new EventEmitter<string>();

  @Input() placeholder = '';
}
