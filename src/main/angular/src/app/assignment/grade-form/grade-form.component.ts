import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-grade-form',
  templateUrl: './grade-form.component.html',
  styleUrls: ['./grade-form.component.scss']
})
export class GradeFormComponent implements OnInit {
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
