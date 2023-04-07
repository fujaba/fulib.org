import {EventService} from '@clashsoft/nestx';
import {Injectable} from '@nestjs/common';
import {CreateSelectionDto, SelectionDto} from './selection.dto';

@Injectable()
export class SelectionService {
  constructor(
    private eventService: EventService,
  ) {
  }

  create(assignment: string, solution: string, dto: CreateSelectionDto): SelectionDto {
    const selection: SelectionDto = {...dto, assignment, solution};
    this.eventService.emit(`selection.${assignment}:${solution}.created`, {event: 'created', data: selection});
    return selection;
  }
}
