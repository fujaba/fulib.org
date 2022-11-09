import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'assigneeColor',
})
export class AssigneeColorPipe implements PipeTransform {

  transform(value: string | undefined): string | undefined {
    if (!value) {
      return undefined;
    }
    const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = (hash % 30) * 12;
    return `hsl(${hue}, 100%, 50%)`;
  }
}
