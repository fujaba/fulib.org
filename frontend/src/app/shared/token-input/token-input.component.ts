import {Component, Input} from '@angular/core';
import {NgbTooltip} from '@ng-bootstrap/ng-bootstrap';
import {ClipboardModule} from 'ngx-clipboard';

@Component({
  selector: 'app-token-input',
  templateUrl: './token-input.component.html',
  styleUrls: ['./token-input.component.scss'],
  imports: [NgbTooltip, ClipboardModule],
})
export class TokenInputComponent {
  @Input() value: string;
  blurred = true;
}
