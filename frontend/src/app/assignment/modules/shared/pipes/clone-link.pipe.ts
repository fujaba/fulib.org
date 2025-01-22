import {Pipe, PipeTransform} from '@angular/core';
import {ReadAssignmentDto} from '../../../model/assignment';
import Solution from '../../../model/solution';
import {Config} from "../../../model/config";


const clonePrefix = {https: 'https://github.com/', ssh: 'git@github.com:'};
const cloneSuffix = {https: '', ssh: '.git'};

@Pipe({
  name: 'cloneLink',
  standalone: false,
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
    const cloneUrl = `${clonePrefix[cloneProtocol]}${org}%2F${prefix}-${user}${cloneSuffix[cloneProtocol]}`;
    switch (ide) {
      case 'vscode':
      case 'code-oss':
      case 'vscodium':
        return `${ide}://vscode.git/clone?url=${cloneUrl}${ref}`;
      case 'idea':
      case 'web-storm':
      case 'pycharm':
        return `jetbrains://${ide}/checkout/git?checkout.repo=${cloneUrl}&idea.required.plugins.id=Git4Idea${ref}`;
    }
  }
}
