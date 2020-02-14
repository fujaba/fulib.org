import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import Assignment from '../model/assignment';
import {AssignmentService} from '../assignment.service';
import Solution from '../model/solution';
import {SolutionService} from '../solution.service';

@Component({
  selector: 'app-solution-list',
  templateUrl: './solution-list.component.html',
  styleUrls: ['./solution-list.component.scss']
})
export class SolutionListComponent implements OnInit {
  assignmentID: string;
  assignment?: Assignment;
  totalPoints?: number;
  solutions?: Solution[];
  searchText: string = '';
  filteredSolutions?: Solution[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
  ) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.assignmentID = params.id;
      this.assignmentService.get(this.assignmentID).subscribe(assignment => {
        this.assignment = assignment;
        this.totalPoints = this.sumPoints(assignment.tasks);
      });
      this.solutionService.getAll(this.assignmentID).subscribe(solutions => {
        this.solutions = solutions;
        this.updateSearch();
      });
    });
  }

  totalResultPoints(solution: Solution) {
    return this.sumPoints(solution.results);
  }

  sumPoints(arr: {points: number}[]) {
    return arr.reduce((acc, item) => acc + item.points, 0);
  }

  setAssignee(solution: Solution, input: HTMLInputElement) {
    input.disabled = true;
    solution.assignment = this.assignment;
    solution.assignee = input.value;
    this.solutionService.setAssignee(solution, input.value).subscribe(() => {
      input.disabled = false;
    });
  }

  updateSearch() {
    const searchWords = this.searchText.split(/\s+/);
    this.filteredSolutions = this.solutions.filter(solution => this.includeInSearch(solution, searchWords));
  }

  includeInSearch({name, studentID, email}: Solution, searchWords: string[]): boolean {
    for (const searchWord of searchWords) {
      if (name.indexOf(searchWord) >= 0 || studentID.indexOf(searchWord) >= 0 || email.indexOf(searchWord) >= 0) {
        return true;
      }
    }
    return false;
  }
}
