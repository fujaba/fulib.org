import {DOCUMENT} from '@angular/common';
import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {switchMap, tap} from 'rxjs/operators';
import {AssignmentService} from '../../../services/assignment.service';
import Assignment, {ReadAssignmentDto} from "../../../model/assignment";
import {MemberService} from "../../../services/member.service";
import {Member} from "../../../../user/member";
import {User} from "../../../../user/user";
import {forkJoin} from "rxjs";
import {UserService} from "../../../../user/user.service";

@Component({
  selector: 'app-assignment-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent implements OnInit {
  assignment?: Assignment | ReadAssignmentDto;
  members: Member[];

  newMember?: User;

  readonly origin: string;

  constructor(
    private assignmentService: AssignmentService,
    private memberService: MemberService,
    private userService: UserService,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) document: Document,
  ) {
    this.origin = document.location.origin;
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid}) => this.assignmentService.get(aid)),
    ).subscribe(assignment => {
      this.assignment = assignment;
    });

    this.route.params.pipe(
      switchMap(({aid}) => this.memberService.findAll(aid)),
      tap(members => this.members = members),
      switchMap(members => forkJoin(members.map(member => this.userService.findOne(member.user).pipe(
        tap(user => member._user = user),
      )))),
    ).subscribe();
  }

  regenerateToken() {
    if (!confirm('Are you sure you want to generate a new token? You will need to re-send the invitation to teaching assistants.')) {
      return;
    }

    this.assignmentService.update(this.assignment!._id, {token: true}).subscribe(assignment => {
      this.assignment = assignment;
    });
  }

  addMember() {
    this.memberService.update({
      parent: this.assignment!._id,
      user: this.newMember!.id!,
      _user: this.newMember!,
    }).subscribe(member => {
      this.members.push(member);
      this.newMember = undefined;
    });
  }

  deleteMember(member: Member) {
    this.memberService.delete(member).subscribe(() => {
      this.members.splice(this.members.indexOf(member), 1);
    });
  }
}
