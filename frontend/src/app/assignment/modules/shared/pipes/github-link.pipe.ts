import {Pipe, PipeTransform} from '@angular/core';
import {ReadAssignmentDto} from '../../../model/assignment';
import Solution from '../../../model/solution';

@Pipe({
  name: 'githubLink',
  standalone: false,
})
export class GithubLinkPipe implements PipeTransform {
  transform(assignment: ReadAssignmentDto, solution: Solution, commit = false): string {
    const org = assignment.classroom?.org;
    const prefix = assignment.classroom?.prefix;
    const user = solution.author.github;
    return `https://github.com/${org}/${prefix}-${user}${commit && solution.commit ? `/tree/${solution.commit}` : ''}`;
  }
}
