import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import {FilterQuery} from 'mongoose';
import {Assignment, AssignmentDocument} from '../assignment/assignment.schema';
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

  @Cron(CronExpression.EVERY_HOUR)
  async preCheckImport() {
    const hour = 60 * 60 * 1000;
    const offset = 12;
    const startDate = new Date(Date.now() + offset * hour);
    startDate.setUTCSeconds(0, 0);
    const endDate = new Date(+startDate + hour);
    const assignments = await this.findAssignmentsBetween(startDate, endDate, {
      'classroom.webhook': {$exists: true},
    });
    if (!assignments.length) {
      return;
    }

    await Promise.all(assignments.map(async a => {
      const webhook = a.classroom!.webhook!;
      try {
        const count = await this.classroomService.countSolutions(a as AssignmentDocument);
        this.notify(webhook, `The deadline for **${a.title}** is in ${offset} hours. So far, there are **${count}** Solutions.`);
      } catch (e: any) {
        if (e.message) {
          this.notify(webhook, `The deadline for **${a.title}** is in ${offset} hours. I failed to count Solutions: ${e.message}\n**PLEASE REVIEW THE ASSIGNMENT SETTINGS**`);
        } else {
          console.error(a.title, e);
        }
      }
    }));
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async autoImport() {
    const startDate = new Date();
    startDate.setUTCSeconds(0, 0);
    const endDate = new Date(+startDate + 60 * 1000);
    const assignments = await this.findAssignmentsBetween(startDate, endDate);
    if (!assignments.length) {
      return;
    }

    await Promise.all(assignments.map(async a => {
      const webhook = a.classroom?.webhook;
      try {
        const ids = await this.classroomService.importSolutions2(a as AssignmentDocument);
        if (webhook) {
          this.notify(webhook, `The deadline for **${a.title}** is over. I imported **${ids.length}** Solutions.`);
        }
      } catch (e: any) {
        if (webhook && e.message) {
          this.notify(webhook, `The deadline for **${a.title}** is over. I failed to import Solutions: ${e.message}`);
        } else {
          console.error(a.title, e);
        }
      }
    }));
  }

  private async findAssignmentsBetween(startDate: Date, endDate: Date, filter: FilterQuery<Assignment> = {}) {
    return this.assignmentService.findAll({
      'classroom.org': {$exists: true},
      'classroom.prefix': {$exists: true},
      deadline: {
        $gte: startDate,
        $lt: endDate,
      },
      ...filter,
    });
  }

  private notify(webhook: string, message: string) {
    this.http.post(webhook, {
      content: message,
    }).subscribe(undefined, console.error);
  }
}
