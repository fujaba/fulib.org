import {Pipe, PipeTransform} from '@angular/core';
import Assignment from '../../../model/assignment';
import Solution from '../../../model/solution';
import {ConfigKey} from '../../../services/config.service';


const clonePrefix = {https: 'https://github.com/', ssh: 'git@github.com:'};
const cloneSuffix = {https: '', ssh: '.git'};

@Pipe({
  name: 'cloneLink',
})
export class CloneLinkPipe implements PipeTransform {
  transform(assignment: Assignment, solution: Solution, options: Record<ConfigKey, string>): string {
    const {ide, cloneProtocol, cloneRef} = options;
    const user = solution.author.github;
    const org = assignment.classroom?.org;
    const prefix = assignment.classroom?.prefix;
    let ref = '';
    switch (cloneRef) {
      case 'commit':
        ref = `&ref=${solution.commit}`;
        break;
      case 'tag':
        ref = `&ref=assignments/${assignment._id}`;
        break;
    }
    return `${ide}://vscode.git/clone?url=${clonePrefix[cloneProtocol]}${org}%2F${prefix}-${user}${cloneSuffix[cloneProtocol]}${ref}`;
  }
}
