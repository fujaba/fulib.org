import {Component} from '@angular/core';
import {ToastService} from '../toast.service';

@Component({
  selector: 'app-toast-list',
  templateUrl: './toast-list.component.html',
  styleUrls: ['./toast-list.component.scss'],
})
export class ToastListComponent {
  constructor(
    public toastService: ToastService,
  ) {
  }
}
