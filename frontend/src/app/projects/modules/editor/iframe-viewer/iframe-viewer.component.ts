import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-iframe-viewer',
  templateUrl: './iframe-viewer.component.html',
  styleUrls: ['./iframe-viewer.component.scss'],
})
export class IframeViewerComponent {
  @Input() src: string;
}
