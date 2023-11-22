import {Controller, Param, Put} from '@nestjs/common';
import {MossService} from "./moss.service";
import {AssignmentAuth} from "../assignment/assignment-auth.decorator";
import {AssignmentService} from "../assignment/assignment.service";
import {SearchService} from "../search/search.service";
import {NotFound, notFound} from "@mean-stream/nestx";
import {SolutionService} from "../solution/solution.service";
import {ApiOperation, ApiTags} from "@nestjs/swagger";
import {Types} from "mongoose";

@Controller('assignments/:assignment/moss')
@ApiTags('MOSS')
export class MossController {
  constructor(
    private mossService: MossService,
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private searchService: SearchService,
  ) {
  }

  @Put()
  @ApiOperation({summary: 'Run MOSS on all solutions of an assignment'})
  @AssignmentAuth({forbiddenResponse: 'You are not allowed to run MOSS on this assignment'})
  @NotFound()
  async runMoss(
    @Param('assignment') assignment: string,
  ): Promise<string> {
    const assignmentDoc = await this.assignmentService.find(new Types.ObjectId(assignment)) || notFound(assignment);
    const files = await this.searchService.findAll(assignment);
    const solutions = await this.solutionService.findAll({assignment: assignmentDoc._id});
    const solutionNames = new Map(solutions.map(({author: {name, github, studentId, email}, _id}) => [
      _id.toString(),
      name || github || studentId || email,
    ]));
    return this.mossService.moss(assignmentDoc, files.map(({solution, file, content}) => ({
      name: solutionNames.get(solution) + ':' + file,
      content,
      size: Buffer.byteLength(content, 'utf8'),
    })));
  }
}
