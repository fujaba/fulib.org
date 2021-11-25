import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model} from 'mongoose';
import {SearchService} from '../search/search.service';
import {CreateEvaluationDto, UpdateEvaluationDto} from './evaluation.dto';
import {Evaluation, Snippet} from './evaluation.schema';

@Injectable()
export class EvaluationService {
  constructor(
    @InjectModel('evaluations') private model: Model<Evaluation>,
    private searchService: SearchService,
  ) {
  }

  async create(assignment: string, solution: string, dto: CreateEvaluationDto, createdBy?: string): Promise<Evaluation> {
    if (dto.codeSearch && dto.snippets.length) {
      delete dto.codeSearch;
      this.codeSearchCreate(assignment, dto);
    }

    return this.model.create({
      assignment,
      solution,
      createdBy,
      ...dto,
    });
  }

  async findAll(where: FilterQuery<Evaluation> = {}): Promise<Evaluation[]> {
    return this.model.find(where).exec();
  }

  async findOne(id: string): Promise<Evaluation | null> {
    return this.model.findById(id).exec();
  }

  async update(id: string, dto: UpdateEvaluationDto): Promise<Evaluation | null> {
    const evaluation = await this.model.findByIdAndUpdate(id, dto, {new: true}).exec();
    if (evaluation && dto.codeSearch && dto.snippets && dto.snippets.length) {
      delete dto.codeSearch;
      this.codeSearchUpdate(evaluation.assignment, dto);
    }
    return evaluation;
  }

  async remove(id: string): Promise<Evaluation | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  private async codeSearch(assignment: string, snippets: Snippet[]): Promise<[string, Snippet[] | undefined][]> {
    const resultss = await Promise.all(snippets.map(snippet => this.searchService.find(assignment, snippet.code)));
    const solutions: Record<string, Snippet[][]> = {};
    for (let results of resultss) {
      for (let result of results) {
        (solutions[result.solution] ??= []).push(result.snippets);
      }
    }
    return Object.entries(solutions)
      .map(([solution, snippetss]) => {
        if (snippetss.find(snippets => !snippets.length)) {
          // remove solutions where any original snippet was not found
          return [solution, undefined];
        }
        return [solution, snippetss.flat()];
      })
    ;
  }

  private async codeSearchCreate(assignment: string, dto: CreateEvaluationDto) {
    const solutions = await this.codeSearch(assignment, dto.snippets);
    return this.model.bulkWrite(solutions.filter(s => s[1]).map(([solution, snippets]) => {
      const filter: FilterQuery<Evaluation> = {
        assignment,
        solution,
        task: dto.task,
      };
      const newEvaluation: CreateEvaluationDto = {
        ...dto,
        author: 'Code Search',
        snippets: snippets!,
      };
      return {
        updateOne: {
          filter,
          update: {$setOnInsert: {assignment, solution, ...newEvaluation}},
          upsert: true,
        },
      };
    }));
  }

  private async codeSearchUpdate(assignment: string, dto: UpdateEvaluationDto) {
    const solutions = await this.codeSearch(assignment, dto.snippets!);
    return this.model.bulkWrite(solutions.map(([solution, snippets]) => {
      const filter: FilterQuery<Evaluation> = {
        assignment,
        solution,
        task: dto.task,
        author: 'Code Search',
      };

      if (!snippets) {
        return {deleteOne: {filter}};
      }

      const updatedEvaluation: UpdateEvaluationDto = {
        ...dto,
        snippets,
      };
      return {
        updateOne: {
          filter,
          update: {$set: updatedEvaluation},
        },
      };
    }));
  }
}
