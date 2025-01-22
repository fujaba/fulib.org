import {Pipe, PipeTransform} from '@angular/core';
import {IDE} from "../../../model/config";
import {ReadAssignmentDto} from "../../../model/assignment";
import Solution from "../../../model/solution";
import {Snippet} from "../../../model/evaluation";


@Pipe({
  name: 'navigateLink',
  standalone: false,
})
export class NavigateLinkPipe implements PipeTransform {
  transform(ide: IDE, assignment: ReadAssignmentDto | undefined, solution: Solution | undefined, snippet: Snippet): string {
    const path = encodeURIComponent(snippet.file);
    switch (ide) {
      case 'vscode':
      case 'vscodium':
      case 'code-oss':
        return `${ide}://fulib.fulibfeedback/open?file=${path}&line=${snippet.from.line}&endline=${snippet.to.line}`;
      case 'idea':
      case 'pycharm':
      case 'web-storm':
        const project = assignment?.classroom?.prefix + '-' + solution?.author?.github;
        return `jetbrains://${ide}/navigate/reference?project=${project}&path=${path}:${snippet.from.line}:${snippet.from.character}`;
    }
  }
}
