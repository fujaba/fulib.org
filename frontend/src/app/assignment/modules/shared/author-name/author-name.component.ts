import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-author-name',
  templateUrl: './author-name.component.html',
  styleUrls: ['./author-name.component.scss'],
  standalone: false,
})
export class AuthorNameComponent {
  @Input() name: string;
  @Input() email?: string;
}
