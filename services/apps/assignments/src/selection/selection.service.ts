import {Injectable} from '@nestjs/common';
import {filter, Observable, Subject} from 'rxjs';
import {CreateSelectionDto, SelectionDto} from './selection.dto';

@Injectable()
export class SelectionService {
  private selections$ = new Subject<SelectionDto>();
  private selections = new Map<string, SelectionDto[]>();

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
    this.selections$.next(selection);
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

  stream(assignment: string, solution: string, author?: string): Observable<SelectionDto> {
    return this.selections$.pipe(filter(s => s.assignment === assignment && s.solution === solution && (!author || s.author === author)));
  }
}
