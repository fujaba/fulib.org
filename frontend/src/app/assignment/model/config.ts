import {IsBoolean, IsEmail, IsIn, IsNotEmpty, IsString} from "class-validator";
import {Presentation} from "@mean-stream/ngbx";
import {Transform} from "class-transformer";

export class Config {
  @Presentation({
    description: 'Your full name for use in assignments, solutions, comments and evaluations.',
  })
  @IsString()
  @IsNotEmpty()
  name = '';

  @Presentation({
    label: 'E-Mail Address',
    description: 'Your email address for use in assignments, solutions, comments and evaluations.',
  })
  @IsEmail()
  email = '';

  @Presentation({
    label: 'IDE',
    description: 'Your preferred IDE for cloning repositories.',
    optionLabels: {
      vscode: 'VSCode',
      'code-oss': 'Code - OSS',
      vscodium: 'VSCodium',
    },
  })
  @IsIn(['vscode', 'code-oss', 'vscodium'])
  ide: 'vscode' | 'code-oss' | 'vscodium' = 'vscode';

  @Presentation({
    label: 'Git Clone Protocol',
    description: 'The protocol to use when cloning a repository.',
    optionLabels: {
      https: 'HTTPS',
      ssh: 'SSH',
    },
  })
  @IsIn(['https', 'ssh'])
  cloneProtocol: 'https' | 'ssh' = 'https';

  @Presentation({
    label: 'Git Clone Ref',
    description: 'The ref to use when cloning a repository. ' +
      'Tags are only supported in VSCode v1.74+ and Assignments imported after 2022-12-21.',
    optionLabels: {
      none: 'None',
      tag: 'Tag',
    },
  })
  @IsIn(['none', 'tag'])
  cloneRef: 'none' | 'tag' = 'tag';

  @Presentation({
    description: 'Enable Code Search globally.',
  })
  @IsBoolean()
  @Transform(({value}) => value === 'true')
  codeSearch = true;

  @Presentation({
    description: 'Enable Similar Solutions globally.',
  })
  @IsBoolean()
  @Transform(({value}) => value === 'true')
  similarSolutions = true;

  @Presentation({
    description: 'Enable Snippet Suggestions globally.',
  })
  @IsBoolean()
  @Transform(({value}) => value === 'true')
  snippetSuggestions = true;
}
