import {HttpClient} from '@angular/common/http';
import {Component, Input, OnInit} from '@angular/core';
import {environment} from '../../../../environments/environment';
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
export class ProjectFormComponent implements OnInit {
  @Input() project: CreateProjectDto;

  dockerImages: Image[];

  constructor(
    private http: HttpClient,
  ) {
  }

  ngOnInit(): void {
    this.http.get(environment.projectsProxyUrl + '/images').subscribe((images: Image[]) => {
      this.dockerImages = images;
    });
  }
}
