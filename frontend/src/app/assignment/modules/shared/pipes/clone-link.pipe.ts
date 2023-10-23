import {Pipe, PipeTransform} from '@angular/core';
import {ReadAssignmentDto} from '../../../model/assignment';
import Solution from '../../../model/solution';
import {Config} from "../../../model/config";


const clonePrefix = {https: 'https://github.com/', ssh: 'git@github.com:'};
const cloneSuffix = {https: '', ssh: '.git'};

@Pipe({
  name: 'cloneLink',
})
export class CloneLinkPipe implements PipeTransform {
  transform(assignment: ReadAssignmentDto, solution: Solution, options: Config): string {
    const {ide, cloneProtocol, cloneRef} = options;
    const user = solution.author.github;
    const org = assignment.classroom?.org;
    const prefix = assignment.classroom?.prefix;
    let ref = '';
    switch (cloneRef) {
      case 'tag':
        ref = `&ref=assignments/${assignment._id}`;
        break;
    }
    return `${ide}://vscode.git/clone?url=${clonePrefix[cloneProtocol]}${org}%2F${prefix}-${user}${cloneSuffix[cloneProtocol]}${ref}`;
  }
}
