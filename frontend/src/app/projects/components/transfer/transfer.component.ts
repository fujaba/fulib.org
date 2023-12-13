import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from '../../../user/user';
import {UserService} from '../../../user/user.service';
import {ProjectService} from '../../services/project.service';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss'],
})
export class TransferComponent implements OnInit {
  projectId: string;
  back: string;

  transferOwner?: User;
  transfering = false;

  constructor(
    private userService: UserService,
    private projectService: ProjectService,
    private router: Router,
    public activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(({id}) => {
      this.projectId = id;
    });
    this.activatedRoute.data.subscribe(({back}) => {
      this.back = back;
    });
  }

  transfer(): void {
    if (!this.transferOwner?.id) {
      return;
    }
    this.transfering = true;
    this.projectService.transfer(this.projectId, this.transferOwner.id).subscribe(() => {
      this.transfering = false;
      this.router.navigate(['/projects']);
    });
  }
}
