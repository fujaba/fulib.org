import {Component, OnInit} from '@angular/core';
import Solution, {Feedback} from "../../../model/solution";
import {ActivatedRoute} from "@angular/router";
import {SolutionService} from "../../../services/solution.service";
import {switchMap} from "rxjs/operators";
import {ToastService} from "@mean-stream/ngbx";

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {
  protected readonly Feedback = Feedback;

  feedback: Feedback = {};
  saved = false;

  constructor(
    private route: ActivatedRoute,
    private solutionService: SolutionService,
    private toastService: ToastService,
  ) {
  }

  ngOnInit() {
    this.route.params.pipe(
      switchMap(({aid, sid}) => this.solutionService.get(aid, sid)),
    ).subscribe(solution => this.setSolution(solution));
  }

  private setSolution(solution: Solution) {
    this.feedback = solution.feedback ?? {};
    this.saved = !!solution.feedback;
  }

  save() {
    const {aid, sid} = this.route.snapshot.params;
    this.solutionService.update(aid, sid, {feedback: this.feedback}).subscribe({
      next: solution => {
        this.setSolution(solution);
        this.toastService.success('Submit Feedback', 'Feedback saved successfully');
      },
      error: error => this.toastService.error('Submit Feedback', 'Failed to save feedback', error),
    });
  }
}
