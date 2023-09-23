import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {EstimatedCosts} from "../model/solution";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Snippet} from "../model/evaluation";
import {map} from "rxjs/operators";

@Injectable()
export class EmbeddingService {
  constructor(
    private http: HttpClient,
  ) {
  }

  import(assignment: string, estimate?: boolean): Observable<EstimatedCosts> {
    return this.http.post<EstimatedCosts>(`${environment.assignmentsApiUrl}/assignments/${assignment}/embeddings`, {}, {
      params: estimate ? {estimate} : undefined,
    });
  }

  findTaskRelatedSnippets(assignment: string, solution: string, task: string): Observable<Snippet[]> {
    return this.http.get<any[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/embeddings`, {
      params: {
        solution,
        task
      }
    }).pipe(
      map(embeddings => embeddings.map(emb => this.convertEmbeddable(emb))),
    );
  }

  findSimilarSnippets(assignment: string, solution: string, snippet: Snippet): Observable<(Snippet & {
    solution: string
  })[]> {
    const id = `${solution}-${snippet.file}-${snippet.from.line}`;
    return this.http.get<any[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/embeddings`, {params: {id}}).pipe(
      map(embeddings => embeddings.map(emb => ({
        ...this.convertEmbeddable(emb),
        solution: emb.solution,
      }))),
    );
  }

  private convertEmbeddable({file, line, text, _score}): Snippet {
    return {
      file,
      from: {line, character: 0},
      to: {line: line + text.split('\n').length - 2, character: 0},
      comment: '',
      score: _score,
      code: text.substring(text.indexOf('\n') + 2),
    };
  }
}
