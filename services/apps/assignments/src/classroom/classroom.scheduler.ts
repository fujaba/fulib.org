import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import {AssignmentDocument} from '../assignment/assignment.schema';
import {AssignmentService} from '../assignment/assignment.service';
import {ClassroomService} from './classroom.service';

@Injectable()
export class ClassroomScheduler {
  constructor(
    private assignmentService: AssignmentService,
    private classroomService: ClassroomService,
    private http: HttpService,
  ) {
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async autoImport() {
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

    await Promise.all(assignments.map(async a => {
      const webhook = a.classroom?.webhook;
      try {
        const ids = await this.classroomService.importSolutions2(a as AssignmentDocument);
        if (webhook) {
          this.http.post(webhook, {
            content: `The deadline for **${a.title}** is over. I imported **${ids.length}** Solutions.`,
          }).subscribe();
        }
      } catch (e: any) {
        if (webhook && e.message) {
          this.http.post(webhook, {
            content: `The deadline for **${a.title}** is over. I failed to import Solutions: ${e.message}`,
          }).subscribe();
        }
      }
    }));
  }
}
