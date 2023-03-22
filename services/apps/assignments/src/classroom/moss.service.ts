import {File, MossApi} from '@app/moss/moss-api';
import {Injectable} from '@nestjs/common';
import {AssignmentDocument} from '../assignment/assignment.schema';
import {AssignmentService} from '../assignment/assignment.service';

@Injectable()
export class MossService {
  constructor(
    private assignmentService: AssignmentService,
  ) {
  }

  async moss(assignment: AssignmentDocument, files: File[]) {
    const moss = new MossApi();
    moss.userid = assignment.classroom?.mossId || 0;
    moss.files = files;
    const result = await moss.send();
    await this.assignmentService.update(assignment._id, {'classroom.mossResult': result});
  }
}
