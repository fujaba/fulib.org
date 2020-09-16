import {Component} from '@angular/core';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent {
  contactEmail = 'spam@fbi.gov'.replace('spam', 'contact').replace('fbi.gov', 'fulib.org');
}
