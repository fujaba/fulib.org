import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: false,
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
  }

  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustUrl(value);
  }
}
