import {Component, OnInit, Optional} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ToastService} from 'ng-bootstrap-ext';
import {forkJoin, of} from 'rxjs';
import {mapTo, switchMap, tap} from 'rxjs/operators';
import {User} from '../../../user/user';
import {UserService} from '../../../user/user.service';
import {Member} from '../../model/member';
import {Project} from '../../model/project';
import {MemberService} from '../../services/member.service';
import {ProjectManager} from '../../services/project.manager';
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
    @Optional() public projectManager: ProjectManager | null,
    private projectService: ProjectService,
    private memberService: MemberService,
    private userService: UserService,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.userService.current$.subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    });

    this.activatedRoute.params.pipe(
      switchMap(({id}) => this.projectService.get(id)),
      switchMap(project => {
        if (project.local) {
          return of(project);
        }
        return this.memberService.findAll(project.id).pipe(
          tap(members => this.members = members),
          switchMap(members => forkJoin(members.map(member => this.userService.findOne(member.userId).pipe(
            tap(user => member.user = user),
          )))),
          mapTo(project),
        );
      }),
    ).subscribe(project => {
      this.project = project;
    });
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
