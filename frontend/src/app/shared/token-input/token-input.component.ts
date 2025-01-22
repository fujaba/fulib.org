import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-token-input',
  templateUrl: './token-input.component.html',
  styleUrls: ['./token-input.component.scss'],
  standalone: false,
})
export class TokenInputComponent {
  @Input() value: string;
  blurred = true;
}
