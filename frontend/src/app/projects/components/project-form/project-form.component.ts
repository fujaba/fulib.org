import {HttpClient} from '@angular/common/http';
import {Component, Input, OnInit} from '@angular/core';
import {ProjectStub} from '../../model/project';

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
export class ProjectFormComponent implements OnInit {
  @Input() project: ProjectStub;

  dockerImages: Image[] = [];

  constructor(
    private http: HttpClient,
  ) {
  }

  ngOnInit() {
    this.http.get<Image[]>('/assets/projects/code-server-images.json').subscribe(images => {
      this.dockerImages = images;
    });
  }
}
