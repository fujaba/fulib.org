import {Component, OnInit} from '@angular/core';
import {EstimatedCosts} from "../../../model/solution";
import {ActivatedRoute} from "@angular/router";
import {map, switchMap, tap} from 'rxjs/operators';
import {EmbeddingService} from "../../../services/embedding.service";
import {ImportTab} from '../import-tab.interface';

@Component({
  selector: 'app-import-embeddings',
  templateUrl: './import-embeddings.component.html',
  styleUrls: ['./import-embeddings.component.scss'],
  standalone: false,
})
export class ImportEmbeddingsComponent implements OnInit, ImportTab {
  costs?: EstimatedCosts;
  costsAreFinal = false;

  // TODO use a shared constant when frontend and backend are merged
  readonly rateLimit = 3000;
  readonly ceil = Math.ceil;

  constructor(
    private embeddingService: EmbeddingService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.route.params.pipe(
      switchMap(({aid}) => this.embeddingService.import(aid, true)),
    ).subscribe(costs => this.costs = costs);
  }

  import() {
    const assignmentId = this.route.snapshot.params.aid;
    return this.embeddingService.import(assignmentId).pipe(
      tap(result => {
        this.costs = result;
        this.costsAreFinal = true;
      }),
      map(result => `Successfully imported ${result.functions.length} function embeddings via OpenAI.`),
    );
  }
}
