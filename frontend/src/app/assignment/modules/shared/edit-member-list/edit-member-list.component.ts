import {Component, Input, OnInit} from '@angular/core';
import {Member} from "../../../../user/member";
import {User} from "../../../../user/user";
import {switchMap, tap} from "rxjs/operators";
import {forkJoin} from "rxjs";
import {MemberService, Namespace} from "../../../services/member.service";
import {UserService} from "../../../../user/user.service";

@Component({
  selector: 'app-edit-member-list',
  templateUrl: './edit-member-list.component.html',
  styleUrls: ['./edit-member-list.component.scss']
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
      switchMap(members => forkJoin(members.map(member => this.userService.findOne(member.user).pipe(
        tap(user => member._user = user),
      )))),
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
