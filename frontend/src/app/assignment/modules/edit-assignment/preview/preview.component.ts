import {Component, OnInit} from '@angular/core';
import {KeycloakService} from 'keycloak-angular';
import {CreateAssignmentDto} from '../../../model/assignment';
import {AssignmentContext} from '../../../services/assignment.context';


@Component({
  selector: 'app-edit-assignment-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  standalone: false,
})
export class PreviewComponent implements OnInit {
  assignment: CreateAssignmentDto;

  loggedIn = false;

  constructor(
    private keycloakService: KeycloakService,
    context: AssignmentContext,
  ) {
    this.assignment = context.getAssignment();
  }

  ngOnInit(): void {
    this.loggedIn = this.keycloakService.isLoggedIn();
  }

  login(): void {
    this.keycloakService.login().then();
  }
}
