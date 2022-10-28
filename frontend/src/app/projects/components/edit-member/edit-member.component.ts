import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {User} from '../../../user/user';
import {MemberService} from '../../services/member.service';

@Component({
  selector: 'app-edit-member',
  templateUrl: './edit-member.component.html',
  styleUrls: ['./edit-member.component.scss'],
})
export class EditMemberComponent implements OnInit {
  back: string;
  user?: User;

  constructor(
    public route: ActivatedRoute,
    private memberService: MemberService,
  ) {
  }

  ngOnInit() {
    this.route.data.subscribe(({back}) => {
      this.back = back;
    });
  }

  addMember() {
    if (!this.user) {
      return;
    }

    this.memberService.update({
      projectId: this.route.snapshot.params.id,
      userId: this.user.id!,
      user: this.user,
    }).subscribe(() => {
      delete this.user;
    });
  }
}
