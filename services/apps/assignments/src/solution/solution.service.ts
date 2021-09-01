import {UserToken} from '@app/keycloak-auth';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model} from 'mongoose';
import {generateToken} from '../utils';
import {CreateSolutionDto, ReadSolutionDto, UpdateSolutionDto} from './solution.dto';
import {Solution, SolutionDocument} from './solution.schema';

@Injectable()
export class SolutionService {
  constructor(
    @InjectModel('solutions') private model: Model<Solution>,
  ) {
  }

  async create(assignment: string, dto: CreateSolutionDto, userId?: string): Promise<SolutionDocument> {
    const token = generateToken();
    return this.model.create({
      ...dto,
      assignment,
      token,
      userId,
      // TODO timeStamp, results
    });
  }

  async findAll(where?: FilterQuery<Solution>): Promise<ReadSolutionDto[]> {
    return this.model.find(where).select(['-token']).exec();
  }

  async findOne(id: string): Promise<SolutionDocument | undefined> {
    return this.model.findById(id).exec();
  }

  mask(solution: Solution): ReadSolutionDto {
    const {token, ...rest} = solution;
    return rest;
  }

  async update(id: string, dto: UpdateSolutionDto): Promise<Solution> {
    return this.model.findByIdAndUpdate(id, dto, {new: true}).exec();
  }

  async remove(id: string): Promise<SolutionDocument | undefined> {
    return this.model.findByIdAndDelete(id);
  }

  isAuthorized(solution: Solution, solutionToken: string, bearerToken: UserToken) {
    return solution.token === solutionToken || bearerToken && bearerToken.sub === solution.userId;
  }
}
