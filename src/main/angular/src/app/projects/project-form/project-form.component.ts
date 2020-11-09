import {Component, Input} from '@angular/core';
import {Project} from '../model/project';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
})
export class ProjectFormComponent {
  @Input() project: Project;
}
