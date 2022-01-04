import {EventService} from '@app/event';
import {Injectable} from '@nestjs/common';
import {CreateSelectionDto, SelectionDto} from './selection.dto';

@Injectable()
export class SelectionService {
  private selections = new Map<string, SelectionDto[]>();

  constructor(
    private eventService: EventService,
  ) {
  }

  private getKey(assignment: string, solution: string) {
    return `${assignment}/${solution}`;
  }

  findAll(assignment: string, solution: string, author?: string): SelectionDto[] {
    const selections = this.selections.get(this.getKey(assignment, solution));
    if (!selections) {
      return [];
    }
    if (author) {
      return selections.filter(s => s.author === author);
    }
    return selections;
  }

  create(assignment: string, solution: string, dto: CreateSelectionDto): SelectionDto {
    const selection: SelectionDto = {...dto, assignment, solution};
    this.save(selection);
    this.eventService.emit(`selection.${assignment}.${solution}.created`, {event: 'created', data: selection});
    return selection;
  }

  private save(selection: SelectionDto) {
    const key = this.getKey(selection.assignment, selection.solution);
    const selections = this.selections.get(key);
    if (selections) {
      const index = selections.findIndex(s => s.author === selection.author);
      if (index >= 0) {
        selections[index] = selection;
      } else {
        selections.push(selection);
      }
    } else {
      this.selections.set(key, [selection]);
    }
  }
}
