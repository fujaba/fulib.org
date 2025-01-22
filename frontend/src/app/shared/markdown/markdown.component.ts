import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import hljs from 'highlight.js/lib/core';
import {MarkdownService} from '../../services/markdown.service';

@Component({
  selector: 'app-markdown',
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.scss'],
  standalone: false,
})
export class MarkdownComponent implements OnInit, OnChanges {
  @ViewChild('content') content: ElementRef<HTMLElement>;

  @Input() markdown?: string;
  @Input() html = 'Loading...';

  constructor(
    private router: Router,
    private markdownService: MarkdownService,
  ) {
  }

  ngOnInit(): void {
    this.renderMarkdown();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.markdown) {
      this.renderMarkdown();
    }
    if (!changes.html) {
      return;
    }
    // setTimeout is needed because ngOnChanges is called before the view is updated.
    // Unfortunately there is no lifecycle hook that triggers after view update and also lets us check if the html actually changed.
    setTimeout(() => {
      hljs.highlightAll();
    }, 0);
  }

  private renderMarkdown(): void {
    if (this.markdown === '') {
      this.html = '';
    }
    if (!this.markdown) {
      return;
    }
    this.markdownService.renderMarkdown(this.markdown).subscribe(html => this.html = html);
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
