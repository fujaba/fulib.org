import {Component, Input} from '@angular/core';
import {CreateAssignmentDto, ReadAssignmentDto} from '../../../model/assignment';

@Component({
  selector: 'app-assignment-info',
  templateUrl: './assignment-info.component.html',
  styleUrls: ['./assignment-info.component.scss'],
  standalone: false,
})
export class AssignmentInfoComponent {
  @Input() assignment?: ReadAssignmentDto | CreateAssignmentDto;
}
