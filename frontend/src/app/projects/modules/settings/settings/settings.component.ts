import {Component, OnInit, Optional} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, Observable} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {User} from '../../../../user/user';
import {UserService} from '../../../../user/user.service';
import {Member} from '../../../model/member';
import {Project} from '../../../model/project';
import {MemberService} from '../../../services/member.service';
import {ProjectManager} from '../../../services/project.manager';
import {ProjectService} from '../../../services/project.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  project?: Project;
  members: Member[] = [];

  newMember?: User;

  constructor(
    public activatedRoute: ActivatedRoute,
    @Optional() public projectManager: ProjectManager | null,
    private projectService: ProjectService,
    private memberService: MemberService,
    private userService: UserService,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(
      switchMap(({id}) => this.projectService.get(id)),
    ).subscribe(project => {
      this.project = project;
    });

    this.activatedRoute.params.pipe(
      switchMap(({id}) => this.memberService.findAll(id)),
      tap(members => this.members = members),
      switchMap(members => forkJoin(members.map(member => this.userService.findOne(member.userId).pipe(
        tap(user => member.user = user),
      )))),
    ).subscribe();
  }

  save(): void {
    this.projectService.update(this.project!).subscribe(result => this.project = result);
  }

  addMember() {
    if (!this.newMember) {
      return;
    }

    this.updateMember({
      projectId: this.project!.id,
      userId: this.newMember.id!,
      user: this.newMember,
    }).subscribe(() => {
      delete this.newMember;
    });
  }

  private updateMember(member: Member): Observable<Member> {
    return this.memberService.update(member).pipe(
      tap(updated => {
        const existing = this.members.findIndex(m => m.userId === updated.userId && m.projectId === updated.projectId);
        if (existing >= 0) {
          this.members[existing] = updated;
        } else {
          this.members.push(updated);
        }
      }),
    );
  }
}
