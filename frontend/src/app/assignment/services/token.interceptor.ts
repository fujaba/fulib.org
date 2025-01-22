import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TokenService} from "./token.service";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private tokenService: TokenService,
  ) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const match = /\/assignments\/([^\/]+)(?:\/solutions\/([^\/]+))?/.exec(request.url);
    if (match) {
      const headers: Record<string, string> = {};
      const assignmentToken = this.tokenService.getAssignmentToken(match[1]);
      if (assignmentToken) {
        headers['Assignment-Token'] = assignmentToken;
      }
      const solutionToken = match[2] && this.tokenService.getSolutionToken(match[1], match[2]);
      if (solutionToken) {
        headers['Solution-Token'] = solutionToken;
      }
      request = request.clone({
        setHeaders: headers,
      });
    }
    return next.handle(request);
  }
}
