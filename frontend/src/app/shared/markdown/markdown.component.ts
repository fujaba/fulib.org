import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import hljs from 'highlight.js/lib/core';

@Component({
  selector: 'app-markdown',
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.scss'],
})
export class MarkdownComponent implements OnInit, OnChanges {
  @ViewChild('content') content: ElementRef<HTMLElement>;

  @Input() html: string;

  constructor(
    private router: Router,
  ) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.html) {
      return;
    }
    // setTimeout is needed because ngOnChanges is called before the view is updated.
    // Unfortunately there is no lifecycle hook that triggers after view update and also lets us check if the html actually changed.
    setTimeout(() => {
      this.content.nativeElement.querySelectorAll<HTMLElement>('pre code').forEach(codeBlock => {
        if (!codeBlock.classList.contains('hljs')) {
          hljs.highlightElement(codeBlock);
        }
      });
    }, 0);
  }

  onClick($event: MouseEvent) {
    if (!($event.target instanceof HTMLAnchorElement)) {
      return;
    }

    const target = $event.target as HTMLAnchorElement;
    const pathname = target.pathname;
    if (!pathname.startsWith('/docs/')) {
      return;
    }

    this.router.navigate([pathname]);
    $event.preventDefault();
  }
}
