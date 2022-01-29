import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {

  transform(value: number): string {
    value |= 0;
    const seconds = value % 60;
    const minutes = 0 | (value / 60) % 60;
    const hours = 0 | (value / 3600);
    return [
      hours && hours + 'h',
      minutes && minutes + 'm',
      seconds && seconds + 's',
    ].filter(x => x).join(' ');
  }
}
