import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {UserToken} from '@app/keycloak-auth';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model, Types, UpdateQuery} from 'mongoose';
import {BatchUpdateSolutionDto, RichSolutionDto, SolutionStatus} from './solution.dto';
import {Solution, SOLUTION_COLLATION, SOLUTION_SORT, SolutionDocument} from './solution.schema';

@Injectable()
@EventRepository()
export class SolutionService extends MongooseRepository<Solution> {
  constructor(
    @InjectModel(Solution.name) public model: Model<Solution>,
    private eventService: EventService,
  ) {
    super(model);
  }

  async findRich(preFilter: FilterQuery<Solution>, postFilter: FilterQuery<RichSolutionDto>): Promise<RichSolutionDto[]> {
    return this.model.aggregate([
      {
        $match: preFilter,
      },
      {
        $lookup: {
          from: 'assignees',
          localField: '_id',
          foreignField: 'solution',
          as: '_assignee',
        },
      },
      {
        $lookup: {
          from: 'evaluations',
          localField: '_id',
          foreignField: 'solution',
          as: '_evaluations',
          pipeline: [
            {
              $project: {
                _id: 1,
                'codeSearch.origin': 1,
                'similarity.origin': 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          assignee: {$first: '$_assignee.assignee'},
          // if points are set: SolutionStatus.graded
          // else if there are no evaluations: SolutionStatus.todo
          // else if all evaluations have an origin: SolutionStatus.codeSearch
          // else: SolutionStatus.started
          status: {
            $cond: {
              if: {$gt: ['$points', null]},
              then: SolutionStatus.graded,
              else: {
                $cond: {
                  if: {$eq: [{$size: '$_evaluations'}, 0]},
                  then: SolutionStatus.todo,
                  else: {
                    $cond: {
                      if: {
                        $allElementsTrue: {
                          $map: {
                            input: '$_evaluations',
                            as: 'evaluation',
                            in: {
                              $or: [
                                {$gt: ['$$evaluation.codeSearch.origin', null]},
                                {$gt: ['$$evaluation.similarity.origin', null]},
                              ],
                            },
                          },
                        },
                      },
                      then: SolutionStatus.codeSearch,
                      else: SolutionStatus.started,
                    },
                  },
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

  async batchUpdate(assignment: Types.ObjectId, dtos: BatchUpdateSolutionDto[]): Promise<(SolutionDocument | null)[]> {
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

  isAuthorized(solution: Solution, user?: UserToken, token?: string): boolean {
    return solution.token === token || !!user && user.sub === solution.createdBy;
  }

  bulkWrite(map: any): Promise<{ upsertedIds: Record<number, Types.ObjectId> }> {
    return this.model.bulkWrite(map);
  }

  private emit(event: string, solution: SolutionDocument) {
    this.eventService.emit(`assignments.${solution.assignment}.solutions.${solution.id}.${event}`, solution);
  }
}
