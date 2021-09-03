import {UserToken} from '@app/keycloak-auth';
import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Request} from 'express';
import {Observable} from 'rxjs';
import {AssignmentService} from './assignment.service';
import {notFound} from '../utils';

@Injectable()
export class AssignmentAuthGuard implements CanActivate {
  constructor(
    private assignmentService: AssignmentService,
  ) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest() as Request;
    const token = req.header('assignment-token');
    const id = req.params.assignment ?? req.params.id;
    const user = (req as any).user;
    return this.checkAuth(id, user, token);
  }

  async checkAuth(id: string, user: UserToken, assignmentToken: string): Promise<boolean> {
    const assignment = await this.assignmentService.findOne(id) ?? notFound(id);
    return this.assignmentService.isAuthorized(assignment, assignmentToken, user);
  }
}
