import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-diagram-view',
  templateUrl: './diagram-view.component.html',
  styleUrls: ['./diagram-view.component.scss'],
})
export class DiagramViewComponent implements OnChanges {
  @Input() url: string;

  type!: 'frame' | 'text' | 'image';

  ngOnChanges(changes: SimpleChanges) {
    if (changes.url) {
      const url = changes.url.currentValue;
      const {pathname} = new URL(url, location.origin);
      this.url = url;
      this.type =
        pathname.endsWith('.yaml') || pathname.endsWith('.txt') ? 'text' :
          pathname.endsWith('.png') || pathname.endsWith('.svg') ? 'image' :
            'frame';
    }
  }
}
