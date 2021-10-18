import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import Solution from '../model/solution';
import {SolutionService} from '../solution.service';
import TaskGrading from '../model/task-grading';
import {UserService} from '../../user/user.service';

@Component({
  selector: 'app-grade-form',
  templateUrl: './grade-form.component.html',
  styleUrls: ['./grade-form.component.scss'],
})
export class GradeFormComponent implements OnInit, OnDestroy {
  @Input() solution: Solution;
  @Input() task: string;
  @Input() grading?: TaskGrading;

  loggedIn = false;
  name: string;
  points: number;
  note: string;

  private userSubscription: Subscription;

  constructor(
    private solutionService: SolutionService,
    private users: UserService,
  ) {
  }

  ngOnInit(): void {
    this.name = this.solutionService.commentName || '';

    this.userSubscription = this.users.current$.subscribe(user => {
      if (user) {
        this.loggedIn = true;
        this.name = `${user.firstName} ${user.lastName}`;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  saveDraft(): void {
    this.solutionService.commentName = this.name;
  }

  doSubmit(): void {
    const grading: TaskGrading = {
      assignment: this.solution.assignment,
      solution: this.solution._id!,
      task: this.task,
      note: this.note,
      points: this.points,
      author: this.name,
    };
    this.solutionService.postGrading(grading).subscribe(result => {
      this.grading = result;
    });
  }
}
