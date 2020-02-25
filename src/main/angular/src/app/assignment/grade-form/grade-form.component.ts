import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import Solution from '../model/solution';
import {SolutionService} from '../solution.service';
import TaskGrading from '../model/task-grading';

@Component({
  selector: 'app-grade-form',
  templateUrl: './grade-form.component.html',
  styleUrls: ['./grade-form.component.scss']
})
export class GradeFormComponent implements OnInit {
  @Input() solution: Solution;
  @Input() taskID: number;

  name: string;
  points: number;
  note: string;

  @Output() submit = new EventEmitter<TaskGrading>();

  constructor(
    private solutionService: SolutionService,
  ) {
  }

  ngOnInit() {
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
      this.submit.emit(result);
    });
  }
}
