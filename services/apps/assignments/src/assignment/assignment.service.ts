import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {UserToken} from '@app/keycloak-auth';
import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {ReadAssignmentDto, ReadTaskDto} from './assignment.dto';
import {Assignment, AssignmentDocument, Task} from './assignment.schema';
import {MemberService} from '@app/member';

@Injectable()
@EventRepository()
export class AssignmentService extends MongooseRepository<Assignment> implements OnModuleInit {
  constructor(
    @InjectModel(Assignment.name) model: Model<Assignment>,
    private eventService: EventService,
    private readonly memberService: MemberService,
  ) {
    super(model);
  }

  async onModuleInit() {
    const result = await this.model.updateMany({
      $or: [
        {'classroom.mossId': {$exists: true}},
        {'classroom.mossLanguage': {$exists: true}},
        {'classroom.mossResult': {$exists: true}},
        {'classroom.openaiApiKey': {$exists: true}},
        {'classroom.openaiModel': {$exists: true}},
        {'classroom.openaiConsent': {$exists: true}},
        {'classroom.openaiIgnore': {$exists: true}},
      ],
    }, {
      $rename: {
        'classroom.mossId': 'moss.userId',
        'classroom.mossLanguage': 'moss.language',
        'classroom.mossResult': 'moss.result',
        'classroom.openaiApiKey': 'openAI.apiKey',
        'classroom.openaiModel': 'openAI.model',
        'classroom.openaiConsent': 'openAI.consent',
        'classroom.openaiIgnore': 'openAI.ignore',
      },
    });
    result.modifiedCount && new Logger(AssignmentService.name).warn(`Migrated ${result.modifiedCount} assignments`);
  }

  findTask(tasks: Task[], id: string): Task | undefined {
    for (const task of tasks) {
      if (task._id == id) {
        return task;
      }
      const subTask = this.findTask(task.children, id);
      if (subTask) {
        return subTask;
      }
    }
    return undefined;
  }

  /**
   * Removes all information from the assignment that should be hidden from unauthorized users.
   * Note that some information will always be hidden (e.g. GitHub token, OpenAI API Key) via Mongoose transforms.
   * @param assignment the assignment to mask.
   * **Do not pass `AssignmentDocument` (use `.toObject()` first), as it will lead to unwanted extra fields.**
   * @returns the masked assignment
   */
  mask(assignment: Assignment): ReadAssignmentDto {
    const {token, tasks, classroom, moss, openAI, ...rest} = assignment;
    const readTasks = assignment.deadline && assignment.deadline.valueOf() > Date.now()
      ? [] // hide tasks if deadline is in the future
      : assignment.tasks.map(t => this.maskTask(t));
    return {
      ...rest,
      tasks: readTasks,
    };
  }

  private maskTask(task: Task): ReadTaskDto {
    const {note, children, ...rest} = task;
    return {
      ...rest,
      children: children?.map(t => this.maskTask(t)),
    };
  }

  async isAuthorized(assignment: Assignment, user?: UserToken, token?: string): Promise<boolean> {
    if (assignment.token === token) {
      return true;
    }
    if (!user) {
      return false;
    }
    return user.sub === assignment.createdBy
      || !!await this.memberService.findOne({parent: assignment._id, user: user.sub});
  }

  private emit(event: string, assignment: AssignmentDocument) {
    const users = [assignment.token, assignment.createdBy].filter((i): i is string => !!i);
    this.eventService.emit(`assignments.${assignment._id}.${event}`, assignment, users);
  }
}
