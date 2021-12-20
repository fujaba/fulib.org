import {Injectable, MessageEvent} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model, UpdateQuery} from 'mongoose';
import {filter, Observable, Subject} from 'rxjs';
import {SearchService} from '../search/search.service';
import {CreateEvaluationDto, UpdateEvaluationDto} from './evaluation.dto';
import {CodeSearchInfo, Evaluation, EvaluationDocument, Snippet} from './evaluation.schema';

@Injectable()
export class EvaluationService {
  private events = new Subject<MessageEvent>();

  constructor(
    @InjectModel('evaluations') public model: Model<Evaluation>,
    private searchService: SearchService,
  ) {
  }

  stream(assignment: string, solution: string): Observable<MessageEvent> {
    return this.events.pipe(filter(e => {
      const evaluation: Evaluation = (e.data as any).evaluation;
      return evaluation.assignment === assignment && evaluation.solution === solution;
    }));
  }

  private fire(event: string, evaluation: EvaluationDocument) {
    this.events.next({data: {event, evaluation}});
  }

  async create(assignment: string, solution: string, dto: CreateEvaluationDto, createdBy?: string): Promise<Evaluation> {
    const {codeSearch, ...rest} = dto;
    const evaluation = await this.model.create({
      assignment,
      solution,
      createdBy,
      ...rest,
    });
    this.fire('created', evaluation);
    if (codeSearch && dto.snippets.length) {
      evaluation.codeSearch = await this.codeSearchCreate(assignment, evaluation._id, dto);
    }
    return evaluation;
  }

  async findAll(where: FilterQuery<Evaluation> = {}): Promise<Evaluation[]> {
    return this.model.find(where).exec();
  }

  async findOne(id: string): Promise<Evaluation | null> {
    return this.model.findById(id).exec();
  }

  async update(id: string, dto: UpdateEvaluationDto): Promise<Evaluation | null> {
    const {codeSearch, ...rest} = dto;
    const evaluation = await this.model.findByIdAndUpdate(id, rest, {new: true}).exec();
    if (!evaluation) {
      return null;
    }

    this.fire('updated', evaluation);
    if (codeSearch && dto.snippets && dto.snippets.length) {
      evaluation.codeSearch = {
        ...evaluation.codeSearch,
        ...await this.codeSearchUpdate(evaluation.assignment, evaluation._id, dto),
      };
    }
    return evaluation;
  }

  async remove(id: string): Promise<Evaluation | null> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    if (!deleted) {
      return null;
    }

    this.fire('deleted', deleted);
    deleted.codeSearch = await this.codeSearchDelete(deleted);
    return deleted;
  }

  private async codeSearch(assignment: string, snippets: Snippet[]): Promise<[string, Snippet[] | undefined][]> {
    const resultsBySnippet = await Promise.all(snippets.map(async snippet => {
      const results = await this.searchService.find(assignment, snippet.code);
      for (let result of results) {
        for (let snippet2 of result.snippets) {
          snippet2.comment = snippet.comment;
        }
      }
      return results;
    }));
    const solutionMatches: Record<string, number> = {};
    const solutionSnippets: Record<string, Snippet[]> = {};
    for (let results of resultsBySnippet) {
      for (let {solution, snippets} of results) {
        solutionMatches[solution] = (solutionMatches[solution] || 0) + 1;
        (solutionSnippets[solution] ??= []).push(...snippets);
      }
    }
    return Object.keys(solutionMatches)
      .map(solution => {
        if (solutionMatches[solution] !== snippets.length) {
          // remove solutions where any original snippet was not found
          return [solution, undefined];
        }
        return [solution, solutionSnippets[solution]];
      })
    ;
  }

  private async codeSearchCreate(assignment: string, origin: any, dto: CreateEvaluationDto): Promise<CodeSearchInfo> {
    const solutions = await this.codeSearch(assignment, dto.snippets);
    const result = await this.model.bulkWrite(solutions.filter(s => s[1]).map(([solution, snippets]) => {
      const filter: FilterQuery<Evaluation> = {
        assignment,
        solution,
        task: dto.task,
      };
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
          filter,
          update: {$setOnInsert: newEvaluation},
          upsert: true,
        },
      };
    }));
    for await (const solution of this.model.find({_id: {$in: Object.values(result.upsertedIds)}})) {
      this.fire('created', solution);
    }
    return {created: result.upsertedCount};
  }

  private async codeSearchUpdate(assignment: string, origin: any, dto: UpdateEvaluationDto): Promise<Partial<CodeSearchInfo>> {
    const solutions = await this.codeSearch(assignment, dto.snippets!);
    let deleted = 0;
    let updated = 0;
    await Promise.all(solutions.map(async ([solution, snippets]) => {
      const filter: FilterQuery<Evaluation> = {
        assignment,
        solution,
        task: dto.task,
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
          this.fire('updated', updatedEval);
          updated++;
        }
      } else {
        const deletedEval = await this.model.findOneAndDelete(filter).exec();
        if (deletedEval) {
          this.fire('deleted', deletedEval);
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
    for (let solution of solutions) {
      this.fire('deleted', solution);
    }
    await this.model.deleteMany({_id: {$in: solutions.map(s => s._id)}});
    return {deleted: solutions.length};
  }
}
