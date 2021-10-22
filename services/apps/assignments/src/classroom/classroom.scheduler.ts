import {Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import {AssignmentDocument} from '../assignment/assignment.schema';
import {AssignmentService} from '../assignment/assignment.service';
import {environment} from '../environment';
import {ClassroomService} from './classroom.service';

@Injectable()
export class ClassroomScheduler {
  constructor(
    private assignmentService: AssignmentService,
    private classroomService: ClassroomService,
  ) {
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async autoImport() {
    const {token} = environment.github;
    if (!token) {
      return;
    }

    const startDate = new Date();
    startDate.setUTCSeconds(0, 0);
    const endDate = new Date(+startDate + 60 * 1000);
    const assignments = await this.assignmentService.findAll({
      'classroom.org': {$exists: true},
      'classroom.prefix': {$exists: true},
      deadline: {
        $gte: startDate,
        $lt: endDate,
      },
    });
    if (!assignments.length) {
      return;
    }

    const results = await Promise.all(assignments.map(async a => {
      const ids = await this.classroomService.importSolutions2(a as AssignmentDocument, token);
      return ids.length;
    }));
    const total = results.reduce((a, c) => a + c, 0);
    console.info('Imported', total, 'Solutions for', results.length, 'Assignments with Deadline', startDate);
  }
}
