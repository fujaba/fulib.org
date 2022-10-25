import {Component, OnInit} from '@angular/core';
import {KeycloakService} from 'keycloak-angular';
import Assignment from '../../../model/assignment';
import Task from '../../../model/task';
import {AssignmentContext} from '../../../services/assignment.context';

@Component({
  selector: 'app-edit-assignment-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {
  assignment: Assignment;
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
    this.keycloakService.isLoggedIn().then(loggedIn => this.loggedIn = loggedIn);
  }

  login(): void {
    this.keycloakService.login().then();
  }
}
