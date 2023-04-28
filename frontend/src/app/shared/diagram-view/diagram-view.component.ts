import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {ThemeService} from '@mean-stream/ngbx';
import {combineLatest, Subject, Subscription} from 'rxjs';

@Component({
  selector: 'app-diagram-view',
  templateUrl: './diagram-view.component.html',
  styleUrls: ['./diagram-view.component.scss'],
})
export class DiagramViewComponent implements OnInit, OnChanges, OnDestroy {
  @Input() url: string;

  type!: 'frame' | 'text' | 'image';

  iframe$ = new Subject<HTMLIFrameElement>();
  subscription!: Subscription;

  constructor(
    private themeService: ThemeService,
  ) {
  }

  ngOnInit() {
    this.subscription = combineLatest([
      this.iframe$,
      this.themeService.theme$,
    ]).subscribe(([frame, theme]) => {
      if (frame && theme) {
        frame.contentWindow?.postMessage({type: 'setTheme', theme}, '*');
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
    this.subscription.unsubscribe();
  }
}
