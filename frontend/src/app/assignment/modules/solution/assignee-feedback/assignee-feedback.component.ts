import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ToastService} from '@mean-stream/ngbx';
import {plainToClass} from 'class-transformer';
import {switchMap} from 'rxjs/operators';
import {Feedback} from '../../../model/assignee';
import {AssigneeService} from '../../../services/assignee.service';

@Component({
  selector: 'app-assignee-feedback',
  templateUrl: './assignee-feedback.component.html',
  styleUrls: ['./assignee-feedback.component.scss'],
  standalone: false,
})
export class AssigneeFeedbackComponent implements OnInit {
  feedback = new Feedback();
  protected readonly Feedback = Feedback;

  constructor(
    private route: ActivatedRoute,
    private assigneeService: AssigneeService,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid, sid}) => this.assigneeService.findOne(aid, sid)),
    ).subscribe(assignee => {
      this.feedback = plainToClass(Feedback, assignee.feedback ?? {});
    });
  }

  save() {
    const {aid, sid} = this.route.snapshot.params;
    this.assigneeService.update(aid, sid, {feedback: this.feedback}).subscribe({
      next: () => this.toastService.success('Feedback', 'Successfully saved Feedback'),
      error: error => this.toastService.error('Feedback', 'Failed to save Feedback', error),
    });
  }
}
