import {UserToken} from '@app/keycloak-auth';
import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Request} from 'express';
import {Observable} from 'rxjs';
import {AssignmentService} from '../assignment/assignment.service';
import {notFound} from '@mean-stream/nestx';
import {SolutionService} from './solution.service';
import {Types} from "mongoose";

@Injectable()
export class SolutionAuthGuard implements CanActivate {
  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
  ) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest() as Request;
    const queryToken = req.query.token?.toString();
    const assignmentToken = req.header('assignment-token') ?? queryToken;
    const solutionToken = req.header('solution-token') ?? queryToken;
    const assignmentId = req.params.assignment;
    const solutionId = req.params.solution ?? req.params.id;
    const user = (req as any).user;
    return this.checkAuth(assignmentId, solutionId, user, assignmentToken, solutionToken);
  }

  async checkAuth(assignmentId: string, solutionId: string, user?: UserToken, assignmentToken?: string, solutionToken?: string): Promise<boolean> {
    const assignment = await this.assignmentService.find(new Types.ObjectId(assignmentId));
    if (!assignment) {
      notFound(assignmentId);
    }

    const privileged = await this.assignmentService.isAuthorized(assignment, user, assignmentToken);
    if (privileged) {
      return true;
    }

    if (solutionId === '*') {
      return false;
    }

    const solution = await this.solutionService.find(new Types.ObjectId(solutionId));
    if (!solution) {
      notFound(solutionId);
    }

    return this.solutionService.isAuthorized(solution, user, solutionToken);
  }
}
