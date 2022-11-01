import {Component, Input} from '@angular/core';
import images from '../../../../../../projects/images.json';
import {CreateProjectDto} from '../../model/project';

interface Image {
  tag: string;
  name: string;
  desc: string;
}

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
})
export class ProjectFormComponent {
  @Input() project: CreateProjectDto;

  dockerImages: Image[] = images;
}
