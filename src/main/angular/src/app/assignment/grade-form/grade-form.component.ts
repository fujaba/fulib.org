import { Component, OnInit, Input } from '@angular/core';
import Solution from '../model/solution';

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

  constructor() { }

  ngOnInit() {
  }

  submit(): void {
    // TODO
  }
}
