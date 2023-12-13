import {UserToken} from '@app/keycloak-auth';
import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Request} from 'express';
import {Observable} from 'rxjs';
import {notFound} from '@mean-stream/nestx';
import {CourseService} from "../course/course.service";
import {MemberService} from "@app/member";
import {Types} from "mongoose";

@Injectable()
export class CourseAuthGuard implements CanActivate {
  constructor(
    private courseService: CourseService,
    private memberService: MemberService,
  ) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest() as Request;
    const id = req.params.course ?? req.params.id;
    const user = (req as any).user;
    return user && this.checkAuth(id, user);
  }

  async checkAuth(id: string, user: UserToken): Promise<boolean> {
    const course = await this.courseService.find(new Types.ObjectId(id)) ?? notFound(id);
    return course.createdBy === user.sub || !!await this.memberService.findOne({
      parent: course._id,
      user: user.sub,
    });
  }
}
