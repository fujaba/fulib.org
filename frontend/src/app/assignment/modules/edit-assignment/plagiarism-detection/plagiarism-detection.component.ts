import {Component} from '@angular/core';
import {AssignmentContext} from "../../../services/assignment.context";
import {ClassroomInfo} from "../../../model/assignment";
import {ConfigService} from "../../../services/config.service";

@Component({
  selector: 'app-plagiarism-detection',
  templateUrl: './plagiarism-detection.component.html',
  styleUrls: ['./plagiarism-detection.component.scss']
})
export class PlagiarismDetectionComponent {
  classroom: ClassroomInfo;
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
    private configService: ConfigService,
  ) {
    this.email = configService.get('email');
    this.classroom = context.assignment.classroom ||= {};
  }
}
