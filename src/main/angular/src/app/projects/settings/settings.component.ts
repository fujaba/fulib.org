import {Component, OnInit} from '@angular/core';
import {Project} from '../model/project';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  constructor(
    public project: Project,
  ) {
  }

  ngOnInit(): void {
  }
}
