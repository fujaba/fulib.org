import {Pipe, PipeTransform} from '@angular/core';
import {Response} from './model/response';

@Pipe({name: 'exception'})
export class ExceptionPipe implements PipeTransform {
  transform(value: Response, scenarioText: string): string | undefined {
    const match = /((\w+\.)*\w+Exception)/.exec(value.output);
    if (!match) {
      return undefined;
    }

    const exceptionClass = match[1];
    const backticks = this.getFenceBackticks(scenarioText);
    const body = `
## Example

${backticks}markdown
${scenarioText}
${backticks}

## Example

\`\`\`
${value.output}
\`\`\`
`;

    return `https://github.com/fujaba/fulibScenarios/issues/new?labels=bug&template=bug_report.md&title=${encodeURIComponent(exceptionClass)}&body=${encodeURIComponent(body)}`;
  }

  /**
   * Determine the string of backticks needed to create a fenced code block around the scenario text.
   * The length of the result is either 3 or 1 plus the length of the longest string of backticks in the text, whichever is greater.
   *
   * For example, if the scenario text contains a fenced code block (```), 4 backticks are needed to put the scenario into an outer fenced
   * code block.
   *
   * @see https://stackoverflow.com/questions/31825237/how-do-i-escape-three-backticks-surrounded-by-a-codeblock-in-markdown
   * @param scenarioText
   * @private
   */
  private getFenceBackticks(scenarioText: string): string {
    let minBackticks = 3;
    for (const match of scenarioText.match(/`+/g) || []) {
      if (match.length >= minBackticks) {
        minBackticks = match.length + 1;
      }
    }
    return '`'.repeat(minBackticks);
  }
}
