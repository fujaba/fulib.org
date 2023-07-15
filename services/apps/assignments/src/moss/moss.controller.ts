import {Controller, Param, Put} from '@nestjs/common';
import {MossService} from "./moss.service";
import {AssignmentAuth} from "../assignment/assignment-auth.decorator";
import {AssignmentService} from "../assignment/assignment.service";
import {SearchService} from "../search/search.service";
import {NotFound, notFound} from "@mean-stream/nestx";

@Controller('assignments/:assignment/moss')
export class MossController {
  constructor(
    private mossService: MossService,
    private assignmentService: AssignmentService,
    private searchService: SearchService,
  ) {
  }

  @Put()
  @AssignmentAuth({forbiddenResponse: 'You are not allowed to run MOSS on this assignment'})
  @NotFound()
  async runMoss(
    @Param('assignment') assignment: string,
  ): Promise<string> {
    const assignmentDoc = await this.assignmentService.findOne(assignment) || notFound(assignment);
    const files = await this.searchService.findAll(assignment);
    return this.mossService.moss(assignmentDoc, files.map(({file, content}) => ({
      name: file,
      content,
      size: Buffer.from(content, 'utf8').length,
    })));
  }
}
