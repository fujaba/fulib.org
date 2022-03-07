import {AfterViewInit, Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild} from '@angular/core';
import {ThemeService} from 'ng-bootstrap-darkmode';

@Component({
  selector: 'app-diagram-view',
  templateUrl: './diagram-view.component.html',
  styleUrls: ['./diagram-view.component.scss'],
})
export class DiagramViewComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('diagramIFrame') diagramIFrame: HTMLIFrameElement;
  @Input() url: string;

  type!: 'frame' | 'text' | 'image';

  constructor(
    private themeService: ThemeService,
  ) {
  }

  ngAfterViewInit() {
    this.themeService.theme$.subscribe(
      (theme) => {
        if (theme) {
          this.diagramIFrame.contentWindow?.postMessage({type: 'setTheme', theme: theme}, '*');
        }
      });
  }

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

  ngOnDestroy() {
    this.themeService.theme$.unsubscribe();
  }
}
