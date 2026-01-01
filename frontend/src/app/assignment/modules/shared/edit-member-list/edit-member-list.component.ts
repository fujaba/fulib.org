import {Component, Input, OnInit} from '@angular/core';
import {switchMap, tap} from 'rxjs/operators';

import {Member, setUsers} from '../../../../user/member';
import {User} from '../../../../user/user';
import {UserService} from '../../../../user/user.service';
import {MemberService, Namespace} from '../../../services/member.service';

@Component({
  selector: 'app-edit-member-list',
  templateUrl: './edit-member-list.component.html',
  styleUrls: ['./edit-member-list.component.scss'],
  standalone: false,
})
export class EditMemberListComponent implements OnInit {
  @Input({required: true}) namespace: Namespace;
  @Input({required: true}) parent: string;
  @Input() owner?: string;

  members: Member[];

  newMember?: User;

  constructor(
    private memberService: MemberService,
    private userService: UserService,
  ) {
  }

  ngOnInit() {
    this.memberService.findAll(this.namespace, this.parent).pipe(
      tap(members => this.members = members),
      switchMap(members => this.userService.findByIds(members.map(m => m.user)).pipe(
        tap(users => setUsers(members, users)),
      )),
    ).subscribe();
  }

  addMember() {
    this.memberService.update(this.namespace, {
      parent: this.parent,
      user: this.newMember!.id!,
      _user: this.newMember!,
    }).subscribe(member => {
      this.members.push(member);
      this.newMember = undefined;
    });
  }

  deleteMember(member: Member) {
    this.memberService.delete(this.namespace, member.parent, member.user).subscribe(() => {
      this.members.splice(this.members.indexOf(member), 1);
    });
  }
}
