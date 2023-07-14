import {Injectable} from "@nestjs/common";
import {OnEvent} from "@nestjs/event-emitter";
import {AssignmentDocument, Task} from "../assignment/assignment.schema";
import {EmbeddingService} from "./embedding.service";

@Injectable()
export class EmbeddingHandler {
  constructor(
    private embeddingService: EmbeddingService,
  ) {
  }

  @OnEvent('assignment.*.created')
  @OnEvent('assignment.*.updated')
  async onAssignment(assignment: AssignmentDocument) {
    const apiKey = assignment.classroom?.openaiApiKey;
    if (!apiKey) {
      return;
    }

    const taskIds = new Set<string>();
    const assignmentId = assignment._id.toString();
    this.upsertTasks(apiKey, assignmentId, assignment.tasks, '', taskIds);
    const deleted = await this.embeddingService.deleteNotIn(assignmentId, [...taskIds]);
    // console.log('Deleted', deleted, 'embeddings');
  }

  @OnEvent('assignment.*.deleted')
  async onAssignmentDeleted(assignment: AssignmentDocument) {
    const deleted = await this.embeddingService.deleteNotIn(assignment._id.toString(), []);
    // console.log('Deleted', deleted, 'embeddings');
  }

  private upsertTasks(apiKey: string, assignment: string, tasks: Task[], prefix: string, taskIds: Set<string>) {
    for (const task of tasks) {
      taskIds.add(task._id);
      this.upsertTask(apiKey, assignment, task, prefix);
      this.upsertTasks(apiKey, assignment, task.children, `${prefix}${task.description} > `, taskIds);
    }
  }

  private upsertTask(apiKey: string, assignment: string, task: Task, prefix: string) {
    return this.embeddingService.upsert({
      id: task._id,
      assignment,
      type: 'task',
      task: task._id,
      text: prefix + task.description,
      embedding: [],
    }, apiKey);
  }
}
