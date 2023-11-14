import {EventService} from '@mean-stream/nestx';
import {UserToken} from '@app/keycloak-auth';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model, UpdateQuery} from 'mongoose';
import {generateToken} from '../utils';
import {BatchUpdateSolutionDto, CreateSolutionDto, RichSolutionDto, UpdateSolutionDto} from './solution.dto';
import {Solution, SolutionDocument} from './solution.schema';

const SOLUTION_SORT = {
  'author.name': 1,
  'author.github': 1,
  timestamp: 1,
} as const;

const SOLUTION_COLLATION = {locale: 'en', caseFirst: 'off'};

@Injectable()
export class SolutionService {
  constructor(
    @InjectModel(Solution.name) public model: Model<Solution>,
    private eventService: EventService,
  ) {
  }

  async create(assignment: string, dto: CreateSolutionDto, createdBy?: string): Promise<SolutionDocument> {
    const created = await this.model.create({
      ...dto,
      assignment,
      createdBy,
      token: generateToken(),
      timestamp: new Date(),
    });
    this.emit('created', created);
    return created;
  }

  async findAll(where: FilterQuery<Solution> = {}): Promise<Solution[]> {
    return this.model
      .find(where)
      .sort(SOLUTION_SORT)
      .collation(SOLUTION_COLLATION)
      .exec();
  }

  async findRich(preFilter: FilterQuery<Solution>, postFilter: FilterQuery<RichSolutionDto>): Promise<RichSolutionDto[]> {
    return this.model.aggregate([
      {
        $match: preFilter,
      },
      {
        $addFields: {id: {$toString: '$_id'}},
      },
      {
        $lookup: {
          from: 'assignees',
          localField: 'id',
          foreignField: 'solution',
          as: '_assignee',
        },
      },
      {
        $lookup: {
          from: 'evaluations',
          localField: 'id',
          foreignField: 'solution',
          as: '_evaluations',
        },
      },
      {
        $addFields: {
          assignee: {$first: '$_assignee.assignee'},
          // if points are set: SolutionStatus.graded
          // else if all evaluations have author 'Code Search': SolutionStatus.codeSearch
          // else if there are any evaluations: SolutionStatus.started
          // otherwise: SolutionStatus.todo
          status: {
            $cond: {
              if: {$gt: ['$points', null]},
              then: 'graded',
              else: {
                $cond: {
                  if: {$gt: [{$size: '$_evaluations'}, 0]},
                  then: {
                    $cond: {
                      if: {
                        $eq: [{
                          $size: {
                            $filter: {
                              input: '$_evaluations',
                              as: 'e',
                              cond: {$ne: ['$$e.author', 'Code Search']}
                            }
                          }
                        }, 0]
                      },
                      then: 'code-search',
                      else: 'started',
                    },
                  },
                  else: 'todo',
                },
              },
            },
          },
        },
      },
      {
        $match: postFilter,
      },
      {
        $project: {
          id: 0,
          _evaluations: 0,
          _assignee: 0,
        },
      },
      {
        $sort: SOLUTION_SORT,
      }
    ], {
      collation: SOLUTION_COLLATION,
    });
  }

  async findOne(id: string): Promise<SolutionDocument | null> {
    return this.model.findById(id).exec();
  }

  async update(id: string, dto: UpdateSolutionDto): Promise<SolutionDocument | null> {
    const updated = await this.model.findByIdAndUpdate(id, dto, {new: true}).exec();
    updated && this.emit('updated', updated);
    return updated;
  }

  async updateMany(assignment: string, dtos: BatchUpdateSolutionDto[]): Promise<(SolutionDocument | null)[]> {
    const updated = await Promise.all(dtos.map(dto => {
      const {_id, author, consent, ...rest} = dto;
      if (!_id && !author) {
        return null;
      }

      const update: UpdateQuery<Solution> = rest;
      if (author) {
        for (const [k, v] of Object.entries(author)) {
          update['author.' + k] = v;
        }
      }
      if (consent) {
        for (const [k, v] of Object.entries(consent)) {
          update['consent.' + k] = v;
        }
      }
      if (_id) {
        return this.model.findByIdAndUpdate(_id, update, {new: true}).exec();
      } else if (author) {
        const filter = {
          assignment,
          $or: Object.entries(author).map(([k, v]) => ({['author.' + k]: v})),
        };
        return this.model.findOneAndUpdate(filter, update, {new: true}).exec();
      } else {
        return null;
      }
    }));
    for (const update of updated) {
      update && this.emit('updated', update);
    }
    return updated;
  }

  async remove(id: string): Promise<SolutionDocument | null> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    deleted && this.emit('deleted', deleted);
    return deleted;
  }

  async removeAll(where: FilterQuery<Solution>): Promise<SolutionDocument[]> {
    const solutions = await this.model.find(where).exec();
    await this.model.deleteMany({_id: {$in: solutions.map(a => a._id)}}).exec();
    for (const solution of solutions) {
      this.emit('deleted', solution);
    }
    return solutions;
  }

  isAuthorized(solution: Solution, user?: UserToken, token?: string): boolean {
    return solution.token === token || !!user && user.sub === solution.createdBy;
  }

  bulkWrite(map: any) {
    return this.model.bulkWrite(map);
  }

  private emit(event: string, solution: SolutionDocument) {
    this.eventService.emit(`assignments.${solution.assignment}.solutions.${solution.id}.${event}`, solution);
  }
}
