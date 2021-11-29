import {Injectable} from '@nestjs/common';
import {filter, Observable, ReplaySubject} from 'rxjs';
import {CreateSelectionDto, SelectionDto} from './selection.dto';

@Injectable()
export class SelectionService {
  private selections = new ReplaySubject<SelectionDto>(1000);

  create(assignment: string, solution: string, dto: CreateSelectionDto): SelectionDto {
    const selection: SelectionDto = {...dto, assignment, solution};
    this.selections.next(selection);
    return selection;
  }

  stream(assignment: string, solution: string, author?: string): Observable<SelectionDto> {
    return this.selections.pipe(filter(s => s.assignment === assignment && s.solution === solution && (!author || s.author === author)));
  }
}
