import {Injectable} from '@angular/core';
import MarkdownIt from 'markdown-it';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarkdownService {
  private readonly parser = new MarkdownIt({
    linkify: true,
    html: true,
    langPrefix: 'language-',
  });

  renderMarkdown(md: string, options: { imageBaseUrl?: string; linkBaseUrl?: string; } = {}): Observable<string> {
    return new Observable(subscriber => {
      subscriber.next(this.renderMarkdownSync(md, options));
      subscriber.complete();
    });
  }

  renderMarkdownSync(md: string, options: { imageBaseUrl?: string; linkBaseUrl?: string }): string {
    const {imageBaseUrl, linkBaseUrl} = options;
    const tokens = this.parser.parse(md, {});
    for (const token of tokens) {
      if (token.type === 'inline') {
        for (const child of (token.children ?? [])) {
          switch (child.type) {
            case 'link_open':
              const href = child.attrGet('href');
              linkBaseUrl && href && child.attrSet('href', linkBaseUrl + href);
              break;
            case 'image':
              const src = child.attrGet('src');
              imageBaseUrl && src && child.attrSet('src', imageBaseUrl + src);
              break;
          }
        }
      } else if (token.type === 'table_open') {
        token.attrSet('class', 'table table-bordered');
      }
    }
    const html = this.parser.renderer.render(tokens, this.parser.options, {});
    return html;
  }
}
