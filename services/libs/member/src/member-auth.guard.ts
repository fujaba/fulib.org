import {UserToken} from '@app/keycloak-auth';
import {objectId} from '@mean-stream/nestx';
import {BadRequestException, CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Request} from 'express';
import {Types} from 'mongoose';
import {Observable} from 'rxjs';
import {MemberService} from './member.service';

@Injectable()
export class MemberAuthGuard implements CanActivate {
  constructor(
    private memberService: MemberService,
  ) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest() as Request;
    let param = req.params.project ?? req.params.id;
    const id = objectId(typeof param === 'string' ? param : param[0], error => new BadRequestException(error));
    const user: UserToken = (req as any).user;
    return this.checkAuth(id, user.sub);
  }

  async checkAuth(parent: Types.ObjectId, user: string): Promise<boolean> {
    return !!await this.memberService.findOne({parent, user});
  }
}
