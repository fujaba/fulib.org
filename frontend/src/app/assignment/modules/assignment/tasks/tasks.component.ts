import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {ReadAssignmentDto} from '../../../model/assignment';
import {AssignmentService} from '../../../services/assignment.service';

@Component({
  selector: 'app-assignment-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class AssignmentTasksComponent implements OnInit {
  assignment?: ReadAssignmentDto;

  constructor(
    private assignmentService: AssignmentService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid}) => this.assignmentService.get(aid)),
    ).subscribe(assignment => {
      this.assignment = assignment;
    });
  }

}
