import {Component, OnInit} from '@angular/core';
import {KeycloakService} from 'keycloak-angular';
import {CreateAssignmentDto} from '../../../model/assignment';
import Task from '../../../model/task';
import {AssignmentContext} from '../../../services/assignment.context';

@Component({
  selector: 'app-edit-assignment-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {
  assignment: CreateAssignmentDto;
  tasks: Task[];

  loggedIn = false;

  constructor(
    private keycloakService: KeycloakService,
    context: AssignmentContext,
  ) {
    this.assignment = context.assignment;
    this.tasks = this.assignment.tasks.filter(t => !t.deleted);
  }

  ngOnInit(): void {
    this.loggedIn = this.keycloakService.isLoggedIn();
  }

  login(): void {
    this.keycloakService.login().then();
  }
}
