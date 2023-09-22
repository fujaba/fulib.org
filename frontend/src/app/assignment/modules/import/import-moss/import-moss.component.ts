import {Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AssignmentService} from "../../../services/assignment.service";
import {tap} from "rxjs/operators";

@Component({
  selector: 'app-import-moss',
  templateUrl: './import-moss.component.html',
  styleUrls: ['./import-moss.component.scss']
})
export class ImportMossComponent {
  mossResult?: string;

  constructor(
    private assignmentService: AssignmentService,
    private route: ActivatedRoute,
  ) {
  }

  import() {
    const assignmentId = this.route.snapshot.params.aid;
    return this.assignmentService.moss(assignmentId).pipe(
      tap(result => this.mossResult = result),
    );
  }
}
