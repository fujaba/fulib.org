import {Component, Input} from '@angular/core';
import {environment} from '../../environments/environment';
import Diagram from '../model/codegen/diagram';
import Response from '../model/codegen/response';

@Component({
  selector: 'app-diagram-view',
  templateUrl: './diagram-view.component.html',
  styleUrls: ['./diagram-view.component.scss'],
})
export class DiagramViewComponent {
  @Input() response: Response;
  @Input() diagram: Diagram;

  get url(): string {
    return environment.apiURL + '/runcodegen/' + this.response.id + '/' + this.diagram.path;
  }
}
