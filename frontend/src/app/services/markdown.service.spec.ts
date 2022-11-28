import {TestBed} from '@angular/core/testing';
import {MarkdownService} from './markdown.service';

describe('MarkdownService', () => {
  let md: MarkdownService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    md = TestBed.inject(MarkdownService);
  });

  it('should render markdown', () => {
    const cases = [
      ['# Hello World\n\nsome **bold** and _italic_ text', '<h1>Hello World</h1>\n' + '<p>some <strong>bold</strong> and <em>italic</em> text</p>\n'],
      // tables
      ['| col1 | col2 |\n|-----|-----|\n|  v1  |  v2  |', '<table class="table table-bordered">\n' + '<thead>\n' + '<tr>\n' + '<th>col1</th>\n' + '<th>col2</th>\n'
      + '</tr>\n' + '</thead>\n' + '<tbody>\n' + '<tr>\n' + '<td>v1</td>\n' + '<td>v2</td>\n' + '</tr>\n'
      + '</tbody>\n' + '</table>\n'],
      // strikethrough
      ['~~strikethrough~~', '<p><s>strikethrough</s></p>\n'],
      // autolink
      ['www.fulib.org\n\nhttps://www.fulib.org', '<p><a href="http://www.fulib.org">www.fulib.org</a></p>\n<p><a href="https://www.fulib.org">https://www.fulib.org</a></p>\n'],
      // ['- [ ] first\n- [x] second', '<ul>\n' + '<li><input type="checkbox" disabled=""> first</li>\n'
      //       + '<li><input type="checkbox" disabled="" checked=""> second</li>\n' + '</ul>\n'],
      // html escaping
      ['<script>alert(\'XSS\')</script>', '<script>alert(\'XSS\')</script>'],
      ['<style>body { background-color: red; }</style>', '<style>body { background-color: red; }</style>'],
      ['<!-- hello world -->', '<!-- hello world -->'],
      // fenced code blocks with language
      ['```java\nSystem.out.println();\n```', '<pre><code class="language-java">System.out.println();\n' + '</code></pre>\n']
    ]
    for (const [input, expected] of cases) {
      expect(md.renderMarkdownSync(input, {})).toEqual(expected);
    }
  });
});
