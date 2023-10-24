import {Injectable} from "@nestjs/common";
import {OnEvent} from "@nestjs/event-emitter";
import {AssignmentDocument, Task} from "../assignment/assignment.schema";
import {EmbeddingService} from "./embedding.service";
import {SolutionDocument} from "../solution/solution.schema";

@Injectable()
export class EmbeddingHandler {
  constructor(
    private embeddingService: EmbeddingService,
  ) {
  }

  @OnEvent('assignments.*.created')
  @OnEvent('assignments.*.updated')
  async onAssignment(assignment: AssignmentDocument) {
    const apiKey = assignment.classroom?.openaiApiKey;
    if (!apiKey) {
      return;
    }

    const taskIds = new Set<string>();
    const assignmentId = assignment._id.toString();
    this.upsertTasks(apiKey, assignmentId, assignment.tasks, '', taskIds);
    await this.embeddingService.deleteNotIn(assignmentId, [...taskIds]);
  }

  @OnEvent('assignments.*.deleted')
  async onAssignmentDeleted(assignment: AssignmentDocument) {
    await this.embeddingService.deleteNotIn(assignment._id.toString(), []);
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

  @OnEvent('assignments.*.solutions.*.deleted')
  async onSolutionDeleted(solution: SolutionDocument) {
    await this.embeddingService.deleteBySolution(solution.assignment, solution.id);
  }
}
