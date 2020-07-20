import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import Solution from '../model/solution';
import {SolutionService} from '../solution.service';
import TaskGrading from '../model/task-grading';
import {UserService} from "../../user/user.service";

@Component({
  selector: 'app-grade-form',
  templateUrl: './grade-form.component.html',
  styleUrls: ['./grade-form.component.scss']
})
export class GradeFormComponent implements OnInit {
  @Input() solution: Solution;
  @Input() taskID: number;
  @Input() gradings?: TaskGrading[];

  loggedIn = false;
  name: string;
  points: number;
  note: string;

  constructor(
    private solutionService: SolutionService,
    private users: UserService,
  ) {
  }

  get filteredGradings(): TaskGrading[] {
    return this.gradings.filter(t => this.taskID === t.taskID);
  }

  ngOnInit() {
    this.loadDraft();
  }

  loadDraft(): void {
    this.name = this.solutionService.commentName;

    // TODO unsubscribe
    this.users.current$.subscribe(user => {
      if (user) {
        this.loggedIn = true;
        this.name = `${user.firstName} ${user.lastName}`;
      }
    });
  }

  saveDraft(): void {
    this.solutionService.commentName = this.name;
  }

  doSubmit(): void {
    const grading: TaskGrading = {
      solution: this.solution,
      taskID: this.taskID,
      note: this.note,
      points: this.points,
      author: this.name,
    };
    this.solutionService.postGrading(grading).subscribe(result => {
      this.gradings.push(result);
    });
  }
}
