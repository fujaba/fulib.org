import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {

  transform(value: number, approx?: boolean): string {
    value |= 0;
    if (!value) {
      return '0s';
    }

    const seconds = value % 60;
    const minutes = 0 | (value / 60) % 60;
    const hours = 0 | (value / 3600);
    const components = [
      hours && hours + 'h',
      minutes && minutes + 'm',
      seconds && seconds + 's',
    ].filter(x => x);
    return approx ? '~' + components[0] : components.join(' ');
  }
}
