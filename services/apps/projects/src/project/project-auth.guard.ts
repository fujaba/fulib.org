import {UserToken} from '@app/keycloak-auth';
import {notFound, objectId} from '@mean-stream/nestx';
import {BadRequestException, CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Request} from 'express';
import {Types} from 'mongoose';
import {Observable} from 'rxjs';
import {ProjectService} from './project.service';

@Injectable()
export class ProjectAuthGuard implements CanActivate {
  constructor(
    private projectService: ProjectService,
  ) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest() as Request;
    const id = objectId(req.params.project ?? req.params.id, error => new BadRequestException(error));
    const user = (req as any).user;
    return this.checkAuth(id, user);
  }

  async checkAuth(id: Types.ObjectId, user: UserToken): Promise<boolean> {
    const project = await this.projectService.findOne(id) ?? notFound(id);
    return this.projectService.isAuthorized(project, user);
  }
}
