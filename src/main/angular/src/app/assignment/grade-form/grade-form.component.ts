import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import Solution from '../model/solution';
import {SolutionService} from '../solution.service';
import TaskGrading from '../model/task-grading';
import {KeycloakService} from "keycloak-angular";

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
    private keycloak: KeycloakService,
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

    this.keycloak.isLoggedIn().then(loggedIn => {
      if (!loggedIn) {
        return;
      }

      this.keycloak.loadUserProfile().then(profile => {
        this.loggedIn = true;
        this.name = `${profile.firstName} ${profile.lastName}`;
      });
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
