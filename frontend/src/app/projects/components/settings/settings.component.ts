import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ToastService} from '@mean-stream/ngbx';
import {forkJoin} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {User} from '../../../user/user';
import {UserService} from '../../../user/user.service';
import {Member} from '../../model/member';
import {Project} from '../../model/project';
import {MemberService} from '../../services/member.service';
import {ProjectService} from '../../services/project.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  project?: Project;
  members: Member[] = [];

  currentUser?: User;

  constructor(
    public activatedRoute: ActivatedRoute,
    private projectService: ProjectService,
    private memberService: MemberService,
    private userService: UserService,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.userService.getCurrent().subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    });

    const id$ = this.activatedRoute.params.pipe(map(({id}): string => id));
    id$.pipe(
      switchMap(id => this.projectService.get(id)),
    ).subscribe(project => this.project = project);

    id$.pipe(
      switchMap(id => this.memberService.findAll(id)),
      tap(members => this.members = members),
      switchMap(members => forkJoin(members.map(member => this.userService.findOne(member.userId).pipe(
        tap(user => member.user = user),
      )))),
    ).subscribe();
  }

  save(): void {
    this.projectService.update(this.project!).subscribe(result => {
      this.project = result;
      this.toastService.success('Update Project', 'Successfully updated project');
    });
  }

  delete(member: Member) {
    if (!confirm(`Are you sure you want to revoke Collaborator status from ${member.user?.firstName} ${member.user?.lastName}? They can be added as a collaborator again later.`)) {
      return;
    }

    this.memberService.delete(member).subscribe(() => {
      this.members.removeFirst(m => m === member);
      this.toastService.warn('Remove Collaborator', 'Successfully removed collaborator');
    });
  }
}
