import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'assigneeColor',
  standalone: false,
})
export class AssigneeColorPipe implements PipeTransform {

  transform(value: string | undefined): string | undefined {
    if (!value) {
      return undefined;
    }
    const hash = value.hashCode();
    const hue = (hash % 30) * 12;
    return `hsl(${hue}, 50%, 50%)`;
  }
}
