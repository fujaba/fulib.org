import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model, Types, UpdateQuery} from 'mongoose';
import {AssignmentService} from '../assignment/assignment.service';
import {SearchService} from '../search/search.service';
import {CreateEvaluationDto, RemarkDto, UpdateEvaluationDto} from './evaluation.dto';
import {CodeSearchInfo, Evaluation, EvaluationDocument, Snippet} from './evaluation.schema';

@Injectable()
@EventRepository()
export class EvaluationService extends MongooseRepository<Evaluation> {
  constructor(
    @InjectModel(Evaluation.name) public model: Model<Evaluation>,
    private eventService: EventService,
    private searchService: SearchService,
    private assignmentService: AssignmentService,
  ) {
    super(model);
  }

  private emit(event: string, evaluation: EvaluationDocument) {
    this.eventService.emit(`assignments.${evaluation.assignment}.solutions.${evaluation.solution}.evaluations.${evaluation.id}.${event}`, evaluation);
  }

  subscribe(assignment: Types.ObjectId, solution: Types.ObjectId, evaluation: Types.ObjectId | '*', event: string, user?: string) {
    // TODO only emit to users that have access to the assignment or solution
    return this.eventService.subscribe<Evaluation>(`assignments.${assignment}.solutions.${solution}.evaluations.${evaluation}.${event}`, user);
  }

  async createWithCodeSearch(assignment: Types.ObjectId, solution: Types.ObjectId, dto: CreateEvaluationDto, createdBy?: string): Promise<Evaluation> {
    const {codeSearch, ...rest} = dto;
    const evaluation = await this.upsert({
      assignment,
      solution,
      task: dto.task,
    }, {
      ...rest,
      assignment,
      solution,
      createdBy,
    });
    if (codeSearch && dto.snippets.length) {
      evaluation.codeSearch = await this.codeSearchCreate(assignment, evaluation._id, dto);
    }
    return evaluation;
  }

  async findUnique(field: keyof Evaluation | string, where: FilterQuery<Evaluation> = {}): Promise<unknown[]> {
    return this.model.distinct(field, where).exec();
  }

  async findRemarks(where: FilterQuery<Evaluation> = {}): Promise<RemarkDto[]> {
    return this.model.aggregate([
      {$match: where},
      {
        $group: {
          _id: {remark: '$remark', points: '$points'},
          count: {$sum: 1},
        },
      },
      {
        $project: {
          _id: 0,
          remark: '$_id.remark',
          points: '$_id.points',
          count: 1,
        },
      },
      {
        $sort: {
          count: -1,
          remark: 1,
          points: 1,
        },
      },
    ]).exec();
  }

  async updateWithCodeSearch(id: Types.ObjectId, dto: UpdateEvaluationDto): Promise<EvaluationDocument | null> {
    const {codeSearch, ...rest} = dto;
    const evaluation = await this.update(id, rest);
    if (evaluation && codeSearch && dto.snippets && dto.snippets.length) {
      evaluation.codeSearch = {
        ...evaluation.codeSearch,
        ...await this.codeSearchUpdate(evaluation.assignment, evaluation.task, evaluation._id, dto),
      };
    }
    return evaluation;
  }

  async deleteWithCodeSearch(id: Types.ObjectId): Promise<EvaluationDocument | null> {
    const deleted = await this.delete(id);
    if (deleted) {
      deleted.codeSearch = await this.codeSearchDelete(deleted);
    }
    return deleted;
  }

  private async codeSearch(assignmentId: Types.ObjectId, taskId: string, snippets: Snippet[]): Promise<[Types.ObjectId, Snippet[] | undefined][]> {
    const assignment = await this.assignmentService.find(assignmentId);
    const task = assignment && this.assignmentService.findTask(assignment.tasks, taskId);
    const resultsBySnippet = await Promise.all(snippets.map(async snippet => {
      const results = await this.searchService.find(assignmentId.toString(), {
        q: snippet.pattern || snippet.code,
        glob: task?.glob,
        wildcard: '***',
      });
      for (const result of results) {
        for (const snippet2 of result.snippets) {
          snippet2.comment = snippet.comment;
        }
      }
      return results;
    }));
    const solutionMatches: Record<string, number> = {};
    const solutionSnippets: Record<string, Snippet[]> = {};
    for (const results of resultsBySnippet) {
      for (const {solution, snippets} of results) {
        solutionMatches[solution] = (solutionMatches[solution] || 0) + 1;
        (solutionSnippets[solution] ??= []).push(...snippets);
      }
    }
    return Object.keys(solutionMatches)
      .map(solution => {
        if (solutionMatches[solution] !== snippets.length) {
          // remove solutions where any original snippet was not found
          return [new Types.ObjectId(solution), undefined];
        }
        return [new Types.ObjectId(solution), solutionSnippets[solution]];
      })
      ;
  }

  private async codeSearchCreate(assignment: Types.ObjectId, origin: Types.ObjectId, dto: CreateEvaluationDto): Promise<CodeSearchInfo> {
    const solutions = await this.codeSearch(assignment, dto.task, dto.snippets);
    const result = await this.model.bulkWrite(solutions.filter(s => s[1]).map(([solution, snippets]) => {
      const newEvaluation: UpdateQuery<Evaluation> = {
        ...dto,
        assignment,
        solution,
        author: 'Code Search',
        snippets,
        codeSearch: {origin},
      };
      return {
        updateOne: {
          filter: {assignment, solution, task: dto.task},
          update: {$setOnInsert: newEvaluation},
          upsert: true,
        },
      };
    }));
    for await (const solution of this.model.find({_id: {$in: Object.values(result.upsertedIds)}})) {
      this.emit('created', solution);
    }
    return {created: result.upsertedCount};
  }

  private async codeSearchUpdate(assignment: Types.ObjectId, task: string, origin: Types.ObjectId, dto: UpdateEvaluationDto): Promise<Partial<CodeSearchInfo>> {
    const solutions = await this.codeSearch(assignment, task, dto.snippets!);
    let deleted = 0;
    let updated = 0;
    await Promise.all(solutions.map(async ([solution, snippets]) => {
      const filter: FilterQuery<Evaluation> = {
        assignment,
        solution,
        task,
        author: 'Code Search',
        codeSearch: {origin},
      };

      if (snippets) {
        const updatedEval = await this.model.findOneAndUpdate(filter, {
          ...dto,
          codeSearch: {origin},
          author: 'Code Search',
          snippets,
        }, {new: true}).exec();
        if (updatedEval) {
          this.emit('updated', updatedEval);
          updated++;
        }
      } else {
        const deletedEval = await this.model.findOneAndDelete(filter).exec();
        if (deletedEval) {
          this.emit('deleted', deletedEval);
          deleted++;
        }
      }
    }));
    return {updated, deleted};
  }

  private async codeSearchDelete(evaluation: EvaluationDocument): Promise<Partial<CodeSearchInfo>> {
    const solutions = await this.model.find({
      assignment: evaluation.assignment,
      task: evaluation.task,
      author: 'Code Search',
      codeSearch: {origin: evaluation._id},
    }).exec();
    for (const solution of solutions) {
      this.emit('deleted', solution);
    }
    await this.model.deleteMany({_id: {$in: solutions.map(s => s._id)}});
    return {deleted: solutions.length};
  }
}
