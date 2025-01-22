import {Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AssignmentService} from "../../../services/assignment.service";
import {map, tap} from 'rxjs/operators';
import {ImportTab} from '../import-tab.interface';

@Component({
  selector: 'app-import-moss',
  templateUrl: './import-moss.component.html',
  styleUrls: ['./import-moss.component.scss'],
  standalone: false,
})
export class ImportMossComponent implements ImportTab {
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
      map(result => `Successfully imported to MOSS. Results are available at: ${result}`),
    );
  }
}
