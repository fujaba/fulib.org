import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
  standalone: false,
})
export class FeedbackComponent {
  constructor(
    public route: ActivatedRoute,
  ) {
  }
}
