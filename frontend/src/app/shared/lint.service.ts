import {Injectable} from '@angular/core';
import {Marker} from './model/marker';
import * as Yaml from 'js-yaml';
import {ValidateFunction} from 'ajv';

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
      const severity = match[4];
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

  evaluateErrorMessage(validate: ValidateFunction): string {
    const errors = validate.errors;

    let result: string = 'Description: \n';

    if (!errors) {
      return result;
    }

    // Wrong Item Index
    let index = errors[0].instancePath;

    // Cleanup Index
    index = index.replace("/", "")

    result += 'Error at entry: ' + index + '\n';

    // Evaluate correct error
    for (const error of errors) {
      if (error.keyword !== 'required') {
        const elementReference = error.params.additionalProperty;

        if (elementReference) {
          result += 'Wrong element: "' + elementReference + '"\n';
        }

        result += error.message;
        break;
      }
    }

    return result;
  }

  lintYamlString(content: string, validate: ValidateFunction): boolean {
    const yaml = Yaml.load(content);

    return validate(yaml);
  }
}
