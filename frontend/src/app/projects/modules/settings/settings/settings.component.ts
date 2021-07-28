import {Component, Inject, OnInit, Optional} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
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
}
