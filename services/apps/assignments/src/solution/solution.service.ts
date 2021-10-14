import {UserToken} from '@app/keycloak-auth';
import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {InjectConnection, InjectModel} from '@nestjs/mongoose';
import {Connection, FilterQuery, Model} from 'mongoose';
import {firstValueFrom} from 'rxjs';
import {AssignmentService} from '../assignment/assignment.service';
import {generateToken, idFilter} from '../utils';
import {CreateSolutionDto, ReadSolutionDto, UpdateSolutionDto} from './solution.dto';
import {Solution, SolutionDocument, TaskResult} from './solution.schema';

interface RepositoryInfo {
  name: string;
  pushed_at: string;
}

interface SearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: RepositoryInfo[];
}

@Injectable()
export class SolutionService {
  constructor(
    @InjectModel('solutions') private model: Model<Solution>,
    @InjectConnection() private connection: Connection,
    private assignmentService: AssignmentService,
    private http: HttpService,
  ) {
    this.migrate();
  }

  async migrate() {
    const solutions = this.connection.collection('solutions');
    const result = await solutions.updateMany({}, {
      $rename: {
        userId: 'createdBy',
        timeStamp: 'timestamp',
        name: 'author.name',
        email: 'author.email',
        studentID: 'author.studentId',
      },
    });
    console.info('Migrated', result.modifiedCount, 'solutions');
  }

  async create(assignment: string, dto: CreateSolutionDto, createdBy?: string): Promise<SolutionDocument> {
    return this.model.create({
      ...dto,
      assignment,
      createdBy,
      token: generateToken(),
      timestamp: new Date(),
      results: await this.results(assignment, dto),
    });
  }

  private async results(assignmentId: string, dto: CreateSolutionDto): Promise<TaskResult[]> {
    const assignment = await this.assignmentService.findOne(assignmentId);
    return assignment ? this.assignmentService.check(dto.solution, assignment) : [];
  }

  async findAll(where: FilterQuery<Solution> = {}): Promise<ReadSolutionDto[]> {
    return this.model.find(where).select(['-token']).sort('+name +timestamp').exec();
  }

  async findOne(id: string): Promise<SolutionDocument | null> {
    return this.model.findOne(idFilter(id)).exec();
  }

  mask(solution: Solution): ReadSolutionDto {
    const {token, ...rest} = solution;
    return rest;
  }

  async import(id: string): Promise<Solution[]> {
    const assignment = await this.assignmentService.findOne(id);
    if (!assignment || !assignment.classroom || !assignment.classroom.org || !assignment.classroom.prefix) {
      return [];
    }

    const query = `org:${assignment.classroom.org} ${assignment.classroom.prefix} in:name`;
    const response = await firstValueFrom(this.http.get<SearchResult>('https://api.github.com/search/repositories', {
      params: {
        q: query,
        per_page: 100, // TODO paginate
      },
      auth: { // TODO
        username: process.env.GITHUB_USERNAME!,
        password: process.env.GITHUB_TOKEN!,
      },
    }));
    const repositories = response.data.items;
    const result = await this.model.bulkWrite(repositories.map(repo => {
      const githubName = repo.name.substring(assignment.classroom!.prefix!.length + 1);
      const solution: Solution = {
        assignment: id,
        author: {
          name: '',
          email: '',
          github: githubName,
          studentID: '',
        },
        solution: '',
        results: [],
        token: generateToken(),
        timestamp: new Date(repo.pushed_at),
      };
      return {
        updateOne: {
          filter: {'author.github': githubName},
          update: {$setOnInsert: solution},
          upsert: true,
        },
      };
    }));
    return this.model.find({_id: {$in: Object.values(result.upsertedIds)}});
  }

  async update(id: string, dto: UpdateSolutionDto): Promise<Solution | null> {
    return this.model.findOneAndUpdate(idFilter(id), dto, {new: true}).exec();
  }

  async remove(id: string): Promise<SolutionDocument | null> {
    return this.model.findOneAndDelete(idFilter(id)).exec();
  }

  isAuthorized(solution: Solution, user?: UserToken, token?: string): boolean {
    return solution.token === token || !!user && user.sub === solution.createdBy;
  }
}
