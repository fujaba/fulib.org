import {EventService} from '@clashsoft/nestx';
import {Injectable} from '@nestjs/common';
import {filter} from 'rxjs';
import {CreateSelectionDto, SelectionDto} from './selection.dto';

@Injectable()
export class SelectionService {
  constructor(
    private eventService: EventService,
  ) {
  }

  create(assignment: string, solution: string, dto: CreateSelectionDto): SelectionDto {
    const selection: SelectionDto = {...dto, assignment, solution};
    // TODO only emit to users that have access to the assignment
    this.eventService.emit(`assignments.${assignment}.solutions.${solution}.selections.created`, selection);
    return selection;
  }

  subscribe(assignment: string, solution: string, event: string, user?: string, author?: string) {
    const stream = this.eventService.subscribe<SelectionDto>(`assignments.${assignment}.solutions.${solution}.selections.${event}`, user);
    if (author) {
      return stream.pipe(filter(({data}) => data.author === author));
    }
    return stream;
  }
}
