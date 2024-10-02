import {File, MossApi} from '@app/moss/moss-api';
import {Injectable} from '@nestjs/common';
import {AssignmentDocument} from '../assignment/assignment.schema';
import {AssignmentService} from '../assignment/assignment.service';
import {MOSS_LANGUAGES} from "../search/search.constants";

@Injectable()
export class MossService {
  constructor(
    private assignmentService: AssignmentService,
  ) {
  }

  async moss(assignment: AssignmentDocument, files: File[]): Promise<string> {
    const moss = new MossApi();
    moss.userid = assignment.moss?.userId || 0;
    const lang = assignment.moss?.language || 'java';
    const exts = MOSS_LANGUAGES[lang];
    moss.language = lang;
    moss.files = files.filter(file => exts.some(ext => file.name.endsWith(ext)));
    const result = await moss.send();
    await this.assignmentService.update(assignment._id, {'classroom.mossResult': result});
    return result;
  }
}
