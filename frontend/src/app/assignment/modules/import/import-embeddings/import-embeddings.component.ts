import {Component, OnInit} from '@angular/core';
import {EstimatedCosts} from "../../../model/solution";
import {SolutionService} from "../../../services/solution.service";
import {ActivatedRoute} from "@angular/router";
import {tap} from "rxjs/operators";

@Component({
  selector: 'app-import-embeddings',
  templateUrl: './import-embeddings.component.html',
  styleUrls: ['./import-embeddings.component.scss']
})
export class ImportEmbeddingsComponent implements OnInit {
  estimatedCosts?: EstimatedCosts;
  finalCosts?: EstimatedCosts;

  constructor(
    private solutionService: SolutionService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.solutionService.importEmbeddings(this.route.snapshot.params.aid, true).subscribe(costs => this.estimatedCosts = costs);
  }

  import() {
    const assignmentId = this.route.snapshot.params.aid;
    return this.solutionService.importEmbeddings(assignmentId).pipe(
      tap(result => this.finalCosts = result),
    );
  }
}
