import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import Comment from "../../model/comment";
import {environment} from "../../../../environments/environment";
import {observeSSE} from "../../services/sse-helper";
import {HttpClient} from "@angular/common/http";
import {TokenService} from "../../services/token.service";
import {StorageService} from "../../../services/storage.service";

@Injectable()
export class CommentService {
  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private storageService: StorageService,
  ) {
  }

  getDraft(solution: string): string | null {
    return this.storageService.get(`commentDraft/${solution}`);
  }

  setDraft(solution: string, draft: string | null) {
    this.storageService.set(`commentDraft/${solution}`, draft);
  }

  findAll(assignment: string, solution: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/comments`);
  }

  post(assignment: string, solution: string, comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/comments`, comment);
  }

  delete(assignment: string, solution: string, comment: string): Observable<Comment> {
    return this.http.delete<Comment>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/comments/${comment}`);
  }

  stream(assignment: string, solution: string): Observable<{ event: string, comment: Comment }> {
    const token = this.tokenService.getSolutionToken(assignment, solution) || this.tokenService.getAssignmentToken(assignment);
    return observeSSE<Comment, 'comment'>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/comments/events?token=${token}`);
  }
}
