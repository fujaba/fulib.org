import {Component, Input} from '@angular/core';
import {ProjectStub} from '../../../model/project';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
})
export class ProjectFormComponent {
  @Input() project: ProjectStub;

  dockerImages = [
    {image: 'fulib/code-server-fulib', name: 'fulib', desc: 'code-server + JDK + Gradle + fulib dependencies (default)'},
    {image: 'fulib/code-server-java', name: 'Java', desc: 'code-server + JDK + Gradle'},
    {image: 'fulib/code-server-node', name: 'Node', desc: 'code-server + Node.js'},
    {image: 'fulib/code-server-latex', name: 'LaTeX', desc: 'code-server + LaTeX'},
    {image: 'fulib/code-server-python', name: 'Python', desc: 'code-server + Python'},
  ];
}
