import {Injectable} from '@angular/core';
import {HtmlRenderer, NodeWalkingStep, Parser} from 'commonmark';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarkdownService {
  private readonly parser = new Parser();

  private renderer = new HtmlRenderer({
    safe: true,
  });

  renderMarkdown(md: string, options: { imageBaseUrl?: string; linkBaseUrl?: string; } = {}): Observable<string> {
    return new Observable(observer => {
      observer.next(this.renderMarkdownSync(options, md));
    });
  }

  renderMarkdownSync(options: { imageBaseUrl?: string; linkBaseUrl?: string }, md: string): string {
    const {imageBaseUrl, linkBaseUrl} = options;
    const root = this.parser.parse(md);
    const walker = root.walker();
    let event: NodeWalkingStep;
    while ((event = walker.next())) {
      const node = event.node;
      if (event.entering && node.type === 'link' && node.destination !== null && linkBaseUrl) {
        node.destination = new URL(node.destination, linkBaseUrl).toString();
      }
      if (event.entering && node.type === 'image' && node.destination !== null && imageBaseUrl) {
        node.destination = new URL(node.destination, imageBaseUrl).toString();
      }
    }
    return this.renderer.render(root);
  }
}
