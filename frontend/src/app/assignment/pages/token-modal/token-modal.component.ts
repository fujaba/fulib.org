import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AssignmentService} from '../../services/assignment.service';
import {SolutionService} from '../../services/solution.service';

@Component({
  selector: 'app-token-modal',
  templateUrl: './token-modal.component.html',
  styleUrls: ['./token-modal.component.scss'],
  standalone: false,
})
export class TokenModalComponent implements OnInit {
  assignment: string;
  solution?: string;
  solutionToken: string;
  assignmentToken: string;

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    public route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(({aid, sid}) => {
      this.assignment = aid;
      this.solution = sid;
    });
  }

  save(): void {
    if (this.solution && this.solutionToken) {
      this.solutionService.setToken(this.assignment, this.solution, this.solutionToken);
    }
    if (this.assignmentToken) {
      this.assignmentService.setToken(this.assignment, this.assignmentToken);
    }
  }
}
