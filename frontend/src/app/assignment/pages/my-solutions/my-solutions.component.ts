import {Component, OnInit} from '@angular/core';
import {ReadAssignmentDto} from '../../model/assignment';
import Solution, {AuthorInfo} from '../../model/solution';
import {SolutionService} from '../../services/solution.service';

@Component({
  selector: 'app-my-solutions',
  templateUrl: './my-solutions.component.html',
  styleUrls: ['./my-solutions.component.scss'],
})
export class MySolutionsComponent implements OnInit {
  author?: AuthorInfo;
  assignments?: ReadAssignmentDto[];
  solutions?: Map<string, Solution[]>;

  constructor(
    private solutionService: SolutionService,
  ) {
  }

  ngOnInit() {
    this.author = this.solutionService.getAuthor();
    this.solutionService.getOwnWithAssignments().subscribe(([assignments, solutions]) => {
      this.assignments = assignments;
      this.solutions = new Map<string, Solution[]>();

      for (const assignment of this.assignments) {
        this.solutions.set(assignment._id, []);
      }

      for (const solution of solutions) {
        this.solutions.get(solution.assignment)!.push(solution);
      }

      for (const [_, solutionList] of this.solutions) {
        solutionList.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
      }
    });
  }
}
