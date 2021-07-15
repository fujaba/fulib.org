import {Component, Input} from '@angular/core';
import Assignment from '../model/assignment';

@Component({
  selector: 'app-assignment-info',
  templateUrl: './assignment-info.component.html',
  styleUrls: ['./assignment-info.component.scss'],
})
export class AssignmentInfoComponent {
  @Input() assignment?: Assignment;
}
