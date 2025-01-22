import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Member} from "../member";

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss'],
  standalone: false,
})
export class MemberListComponent<M extends Member> {
  @Input() members: M[];
  @Input() owner?: string;
  @Output() deleted = new EventEmitter<M>();

  delete(member: M) {
    this.deleted.emit(member);
  }
}
