import {Injectable} from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class ScenarioEditorService {
  foldInternalCalls(packageName: string, outputLines: string[]): string[] {
    packageName = packageName.replace('/', '.');
    const packageNamePrefix = `\tat ${packageName}.`;
    const result: string[] = [];
    let counter = 0;
    for (const line of outputLines) {
      if (line.startsWith('\tat org.fulib.scenarios.tool.')
        || line.startsWith('\tat ') && !line.startsWith('\tat org.fulib.') && !line.startsWith(packageNamePrefix)) {
        counter++;
      } else {
        if (counter > 0) {
          result.push(counter === 1 ? '\t(1 internal call)' : `\t(${counter} internal calls)`);
          counter = 0;
        }
        result.push(line);
      }
    }
    return result;
  }
}
