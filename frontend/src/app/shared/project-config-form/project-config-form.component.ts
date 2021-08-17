import {Component, Input} from '@angular/core';
import {ProjectConfig} from '../../model/project-config';

@Component({
  selector: 'app-project-config-form',
  templateUrl: './project-config-form.component.html',
  styleUrls: ['./project-config-form.component.scss'],
})
export class ProjectConfigFormComponent {
  @Input() config: ProjectConfig;
}
