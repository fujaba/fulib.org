import {Pipe, PipeTransform, SecurityContext} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Pipe({name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
  }

  transform(value: string): SafeHtml {
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, value);
    return this.sanitizer.bypassSecurityTrustHtml(sanitized ?? '');
  }
}
