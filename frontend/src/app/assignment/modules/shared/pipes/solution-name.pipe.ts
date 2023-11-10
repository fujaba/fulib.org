import {Pipe, PipeTransform} from '@angular/core';
import Solution from '../../../model/solution';

@Pipe({
  name: 'solutionName',
})
export class SolutionNamePipe implements PipeTransform {
  transform(solution?: Solution): string {
    if (!solution) {
      return '';
    }
    const {name, github, studentId, email} = solution.author;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return name || github || studentId || email || '';
  }
}
