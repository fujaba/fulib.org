import {Injectable} from "@nestjs/common";
import {OnEvent} from "@nestjs/event-emitter";
import {Assignment, AssignmentDocument, Task} from "../assignment/assignment.schema";
import {EmbeddingService} from "./embedding.service";
import {SolutionDocument} from "../solution/solution.schema";
import {DEFAULT_MODEL} from "./openai.service";

@Injectable()
export class EmbeddingHandler {
  constructor(
    private embeddingService: EmbeddingService,
  ) {
  }

  @OnEvent('assignments.*.created')
  @OnEvent('assignments.*.updated')
  async onAssignment(assignment: AssignmentDocument) {
    if (!assignment.openAI?.apiKey) {
      return;
    }

    const taskIds = new Set<string>();
    this.upsertTasks(assignment, assignment.tasks, '', taskIds);
    await this.embeddingService.deleteTasksNotIn(assignment._id.toString(), [...taskIds]);
  }

  @OnEvent('assignments.*.deleted')
  async onAssignmentDeleted(assignment: AssignmentDocument) {
    await this.embeddingService.deleteAll(assignment._id.toString());
  }

  private upsertTasks(assignment: Assignment, tasks: Task[], prefix: string, taskIds: Set<string>) {
    for (const task of tasks) {
      taskIds.add(task._id);
      this.upsertTask(assignment, task, prefix);
      this.upsertTasks(assignment, task.children, `${prefix}${task.description} > `, taskIds);
    }
  }

  private upsertTask(assignment: Assignment, task: Task, prefix: string) {
    return this.embeddingService.upsert({
      id: task._id,
      assignment: assignment._id.toString(),
      type: 'task',
      task: task._id,
      text: prefix + task.description,
      embedding: [],
    }, assignment.openAI!.apiKey!, assignment.openAI!.model ?? DEFAULT_MODEL);
  }

  @OnEvent('assignments.*.solutions.*.deleted')
  async onSolutionDeleted(solution: SolutionDocument) {
    await this.embeddingService.deleteBySolution(solution.assignment.toString(), solution.id);
  }
}
