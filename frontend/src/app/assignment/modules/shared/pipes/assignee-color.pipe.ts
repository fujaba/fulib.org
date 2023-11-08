import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'assigneeColor',
})
export class AssigneeColorPipe implements PipeTransform {

  transform(value: string | undefined): string | undefined {
    if (!value) {
      return undefined;
    }
    const hash = hashCode(value);
    const hue = (hash % 30) * 12;
    return `hsl(${hue}, 50%, 50%)`;
  }
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
