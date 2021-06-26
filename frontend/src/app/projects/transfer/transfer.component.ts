import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
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
export class TransferComponent implements OnInit, OnDestroy {
  @ViewChild('transferModal', {static: true}) transferModal: TemplateRef<any>;

  projectId: string;
  back: string;

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
    this.activatedRoute.params.subscribe(({id}) => {
      this.projectId = id;
    });
    this.activatedRoute.data.subscribe(({back}) => {
      this.back = back;
    });
    this.open();
  }

  ngOnDestroy() {
    this.transferModalRef?.dismiss();
    this.transferModalRef = undefined;
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
      this.router.navigate([this.back], {relativeTo: this.activatedRoute, queryParamsHandling: 'preserve'});
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
