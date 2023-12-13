import {Component, OnInit} from '@angular/core';
import {AssignmentService} from "../../../services/assignment.service";
import * as jsdiff from "diff";
import {ActivatedRoute} from "@angular/router";
import {AssignmentContext} from "../../../services/assignment.context";
import {switchMap} from "rxjs/operators";
import {TaskMarkdownService} from "../task-markdown.service";

@Component({
  selector: 'app-diff-modal',
  templateUrl: './diff-modal.component.html',
  styleUrl: './diff-modal.component.scss'
})
export class DiffModalComponent implements OnInit {
  diffMetadata = '';
  diffTasks = '';

  constructor(
    private route: ActivatedRoute,
    private context: AssignmentContext,
    private assignmentService: AssignmentService,
    private taskMarkdownService: TaskMarkdownService,
  ) {
  }

  ngOnInit() {
    this.route.params.pipe(
      switchMap(({aid}) => this.assignmentService.get(aid)),
    ).subscribe(oldAssignment => {
      const {tasks: oldTasks, ...old} = oldAssignment;
      const {tasks: newTasks, ...current} = this.context.assignment;
      this.diffMetadata = renderDiff(jsdiff.diffJson(old, current));
      const oldTasksMd = this.taskMarkdownService.renderTasks(oldTasks);
      const newTasksMd = this.taskMarkdownService.renderTasks(newTasks);
      this.diffTasks = renderDiff(jsdiff.diffWords(oldTasksMd, newTasksMd));
    });
  }
}

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
