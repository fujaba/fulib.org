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
    return name ?? github ?? studentId ?? email ?? '';
  }
}
