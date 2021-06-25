import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {combineLatest, Observable, OperatorFunction} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, switchMap} from 'rxjs/operators';
import {User} from '../../user/user';
import {UserService} from '../../user/user.service';
import {ProjectService} from '../project.service';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss'],
})
export class TransferComponent implements OnInit {
  @ViewChild('transferModal', {static: true}) transferModal: TemplateRef<any>;

  projectId: string;

  transferOwner?: User;
  transfering = false;
  transferModalRef?: NgbModalRef;

  search: OperatorFunction<string, User[]> = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    filter(term => term.length >= 2),
    switchMap(term => this.userService.findAll(term)),
  );

  formatter = (user: User) => `${user.firstName} ${user.lastName} (${user.username})`;

  constructor(
    private userService: UserService,
    private projectService: ProjectService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ngbModal: NgbModal,
  ) {
  }

  ngOnInit(): void {
    combineLatest([
      this.activatedRoute.params,
      this.activatedRoute.queryParams,
    ]).pipe(
      map(([params, queryParams]) => {
        let projectId: string | undefined = queryParams.transfer;
        if (projectId === 'true') {
          projectId = params.id;
        }
        return projectId;
      }),
    ).subscribe(projectId => {
      if (projectId) {
        this.projectId = projectId;
        this.open();
      } else {
        this.transferModalRef?.dismiss();
        this.transferModalRef = undefined;
      }
    });
  }

  open(): void {
    if (this.transferModalRef) {
      return;
    }
    this.transferModalRef = this.ngbModal.open(this.transferModal, {
      ariaLabelledBy: 'transfer-modal-title',
      beforeDismiss: () => !this.transfering,
    });
    this.transferModalRef.hidden.subscribe(() => {
      this.router.navigate([], {queryParams: {transfer: null}, queryParamsHandling: 'merge'});
    });
  }

  transfer(): void {
    if (!this.transferOwner || !this.transferOwner.id) {
      return;
    }
    this.transfering = true;
    this.projectService.transfer(this.projectId, this.transferOwner.id).subscribe(() => {
      this.transfering = false;
      this.router.navigate(['/projects']);
      this.transferModalRef?.close();
      this.transferModalRef = undefined;
    });
  }
}
