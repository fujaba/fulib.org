import {Component, EventEmitter, Input, Output} from '@angular/core';
import {merge, OperatorFunction, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {Snippet} from '../../../model/evaluation';
import {selectionComment} from '../snippet-list/snippet-list.component';

@Component({
  selector: 'app-edit-snippet',
  templateUrl: './edit-snippet.component.html',
  styleUrls: ['./edit-snippet.component.scss'],
  standalone: false,
})
export class EditSnippetComponent {
  readonly selectionComment = selectionComment;

  @Input() index: number;
  @Input() snippet: Snippet;
  @Input() comments: string[] = [];
  @Output() deleted = new EventEmitter();

  commentFocus$ = new Subject<string>();

  commentTypeahead: OperatorFunction<string, string[]> = text$ => merge(
    this.commentFocus$,
    text$.pipe(debounceTime(200)),
  ).pipe(
    distinctUntilChanged(),
    map(searchInput => this.comments.filter(c => c.includes(searchInput))),
  );

  delete() {
    this.deleted.next(undefined);
  }
}
