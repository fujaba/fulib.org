import {Injectable} from '@angular/core';
import {Marker} from './model/marker';

@Injectable({providedIn: 'root'})
export class LintService {

  lint(output: string): Marker[] {
    const result: Marker[] = [];

    for (const line of output.split('\n')) {
      const match = /^.*\.md:(\d+):(\d+)(?:-(\d+))?: (error|syntax|warning|note): (.*)$/.exec(line);
      if (!match) {
        continue;
      }

      const row = +match[1] - 1;
      const col = +match[2];
      const endCol = +(match[3] || col) + 1;
      const severity = match[4] === 'syntax' ? 'error' : match[4];
      const message = match[5];

      result.push({
        severity,
        message,
        from: {line: row, ch: col},
        to: {line: row, ch: endCol},
      });
    }

    return result;
  }
}
