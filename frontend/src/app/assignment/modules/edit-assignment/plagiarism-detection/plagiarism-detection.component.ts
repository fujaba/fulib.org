import {Component} from '@angular/core';
import {AssignmentContext} from '../../../services/assignment.context';
import {MossConfig} from '../../../model/assignment';
import {ConfigService} from '../../../services/config.service';

@Component({
  selector: 'app-plagiarism-detection',
  templateUrl: './plagiarism-detection.component.html',
  styleUrls: ['./plagiarism-detection.component.scss'],
  standalone: false,
})
export class PlagiarismDetectionComponent {
  moss: MossConfig;
  email: string;

  mossLanguages = {
    java: 'Java',
    javascript: 'JavaScript',
    python: 'Python',
    c: 'C',
    cc: 'C++',
    csharp: 'C#',
  };

  constructor(
    readonly context: AssignmentContext,
    configService: ConfigService,
  ) {
    this.email = configService.get('email');
    this.moss = context.assignment.moss ??= {};
  }
}
