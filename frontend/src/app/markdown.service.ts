import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MarkdownService {
  constructor(
    private http: HttpClient,
  ) {
  }

  renderMarkdown(md: string, options: { imageBaseUrl?: string; linkBaseUrl?: string; } = {}): Observable<string> {
    const {imageBaseUrl, linkBaseUrl} = options;
    const params: Record<string, string> = {};
    if (imageBaseUrl) {
      params.image_base_url = imageBaseUrl;
    }
    if (linkBaseUrl) {
      params.link_base_url = linkBaseUrl;
    }
    return this.http.post(`${environment.apiURL}/rendermarkdown`, md, {
      responseType: 'text',
      params,
    });
  }
}
