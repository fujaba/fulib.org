import {AfterViewChecked, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import hljs from 'highlight.js/lib/core';

@Component({
  selector: 'app-markdown',
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.scss'],
})
export class MarkdownComponent implements OnInit, AfterViewChecked {
  @ViewChild('content') content: ElementRef<HTMLElement>;

  @Input() html: string;

  constructor(
    private router: Router,
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
    this.content.nativeElement.querySelectorAll('pre code').forEach(codeBlock => {
      if (!codeBlock.classList.contains('hljs')) {
        hljs.highlightElement(codeBlock);
      }
    });
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
