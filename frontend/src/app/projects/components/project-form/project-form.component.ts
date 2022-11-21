import {HttpClient} from '@angular/common/http';
import {Component, Input, OnInit} from '@angular/core';
import * as icons from 'bootstrap-icons/font/bootstrap-icons.json';
import {Observable, OperatorFunction} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
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
  icons = Object.keys(icons).filter(key => !['-fill', '-alt', '1', '2', '3', '4'].find(s => key.endsWith(s)));

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => term.length < 2 ? []
      : this.icons.filter(v => v.includes(term.toLowerCase())).slice(0, 10)),
  );

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
