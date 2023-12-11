import {Component, OnInit} from '@angular/core';
import {KeycloakService} from 'keycloak-angular';
import {CreateAssignmentDto} from '../../../model/assignment';
import {AssignmentContext} from '../../../services/assignment.context';
import * as jsdiff from 'diff';
import {AssignmentService} from "../../../services/assignment.service";
import {TaskMarkdownService} from "../task-markdown.service";

function escapeHtml(text: string) {
  return text.replace(/[&<>"'`=\/]/g, function (s) {
    return `&#${s.charCodeAt(0)};`;
  });
}

function renderDiff(diff: jsdiff.Change[]) {
  return diff.map(part => {
    const color = part.added ? 'text-success' : part.removed ? 'text-danger' : '';
    return `<span class="${color}">${escapeHtml(part.value)}</span>`;
  }).join('');
}

@Component({
  selector: 'app-edit-assignment-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {
  assignment: CreateAssignmentDto;
  diffMetadata?: string;
  diffTasks?: string;

  loggedIn = false;

  constructor(
    private keycloakService: KeycloakService,
    context: AssignmentContext,
    private assignmentService: AssignmentService,
    private taskMarkdownService: TaskMarkdownService,
  ) {
    this.assignment = context.getAssignment();
  }

  ngOnInit(): void {
    this.loggedIn = this.keycloakService.isLoggedIn();

    if ('_id' in this.assignment) {
      this.assignmentService.get(this.assignment._id as string).subscribe(oldAssignment => {
        const {tasks: oldTasks, ...old} = oldAssignment;
        const {tasks: newTasks, ...current} = this.assignment;
        this.diffMetadata = renderDiff(jsdiff.diffJson(old, current));
        const oldTasksMd = this.taskMarkdownService.renderTasks(oldTasks);
        const newTasksMd = this.taskMarkdownService.renderTasks(newTasks);
        this.diffTasks = renderDiff(jsdiff.diffWords(oldTasksMd, newTasksMd));
      });
    }
  }

  login(): void {
    this.keycloakService.login().then();
  }
}
