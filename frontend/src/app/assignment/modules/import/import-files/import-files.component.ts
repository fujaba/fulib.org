import {Component} from '@angular/core';
import {SolutionService} from "../../../services/solution.service";
import {ActivatedRoute} from "@angular/router";
import {ImportTab} from '../import-tab.interface';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-import-files',
  templateUrl: './import-files.component.html',
  styleUrls: ['./import-files.component.scss'],
  standalone: false,
})
export class ImportFilesComponent implements ImportTab {
  files: File[] = [];

  constructor(
    private solutionService: SolutionService,
    private route: ActivatedRoute,
  ) {
  }

  setFiles(files: FileList) {
    this.files = Array.from(files);
  }

  import() {
    const assignmentId = this.route.snapshot.params.aid;
    return this.solutionService.import(assignmentId, this.files).pipe(
      map(results => `Successfully imported ${results.length} solutions from files`),
    );
  }
}
