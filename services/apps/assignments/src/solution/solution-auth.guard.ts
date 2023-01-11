import {UserToken} from '@app/keycloak-auth';
import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Request} from 'express';
import {Observable} from 'rxjs';
import {AssignmentService} from '../assignment/assignment.service';
import {notFound} from '@clashsoft/nestx';
import {SolutionService} from './solution.service';

@Injectable()
export class SolutionAuthGuard implements CanActivate {
  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
  ) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest() as Request;
    const assignmentToken = req.header('assignment-token') ?? req.query.token?.toString();
    const solutionToken = req.header('solution-token');
    const assignmentId = req.params.assignment;
    const solutionId = req.params.solution ?? req.params.id;
    const user = (req as any).user;
    return this.checkAuth(assignmentId, solutionId, user, assignmentToken, solutionToken);
  }

  async checkAuth(assignmentId: string, solutionId: string, user?: UserToken, assignmentToken?: string, solutionToken?: string): Promise<boolean> {
    const assignment = await this.assignmentService.findOne(assignmentId);
    if (!assignment) {
      notFound(assignmentId);
    }

    const solution = await this.solutionService.findOne(solutionId);
    if (!solution) {
      notFound(solutionId);
    }

    const privileged = this.assignmentService.isAuthorized(assignment, user, assignmentToken);
    const authorized = this.solutionService.isAuthorized(solution, user, solutionToken);
    return privileged || authorized;
  }
}
