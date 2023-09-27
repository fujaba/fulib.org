import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Member} from "../member";

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent {
  @Input() members: Member[];
  @Input() owner?: string;
  @Output() deleted = new EventEmitter<Member>();

  delete(member: Member) {
    this.deleted.emit(member);
  }
}
