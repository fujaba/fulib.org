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

  async create(assignment: string, dto: CreateSolutionDto, createdBy?: string): Promise<SolutionDocument> {
    const token = generateToken();
    const timestamp = new Date();
    return this.model.create({
      ...dto,
      assignment,
      token,
      createdBy,
      timestamp,
      // TODO results
    });
  }

  async findAll(where: FilterQuery<Solution> = {}): Promise<ReadSolutionDto[]> {
    return this.model.find(where).select(['-token']).sort('+name +timestamp').exec();
  }

  async findOne(id: string): Promise<SolutionDocument | null> {
    return this.model.findById(id).exec();
  }

  mask(solution: Solution): ReadSolutionDto {
    const {token, ...rest} = solution;
    return rest;
  }

  async update(id: string, dto: UpdateSolutionDto): Promise<Solution | null> {
    return this.model.findByIdAndUpdate(id, dto, {new: true}).exec();
  }

  async remove(id: string): Promise<SolutionDocument | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  isAuthorized(solution: Solution, user?: UserToken, token?: string): boolean {
    return solution.token === token || !!user && user.sub === solution.createdBy;
  }
}
