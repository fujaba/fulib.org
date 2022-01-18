import {EventService} from '@app/event';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model} from 'mongoose';
import {CreateTelemetryDto} from './telemetry.dto';
import {Telemetry, TelemetryDocument} from './telemetry.schema';

@Injectable()
export class TelemetryService {
  constructor(
    @InjectModel('telemetry') public model: Model<Telemetry>,
    private eventService: EventService,
  ) {
  }

  private emit(event: 'created', telemetry: TelemetryDocument) {
    this.eventService.emit(`telemetry.${telemetry.id}.${event}`, {event, data: telemetry});
  }

  async create(assignment: string, solution: string, dto: CreateTelemetryDto, createdBy?: string): Promise<Telemetry> {
    const telemetry = await this.model.create({
      assignment,
      solution,
      createdBy,
      ...dto,
    });
    this.emit('created', telemetry);
    return telemetry;
  }

  async findAll(where: FilterQuery<Telemetry> = {}): Promise<TelemetryDocument[]> {
    return this.model.find(where).exec();
  }
}
