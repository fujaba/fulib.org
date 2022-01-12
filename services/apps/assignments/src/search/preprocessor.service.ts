import {Injectable} from '@nestjs/common';

@Injectable()
export class PreprocessorService {
  preprocess(code: string): string {
    code = this.stripBlockComments(code);
    code = this.stripLineComments(code);
    return code;
  }

  stripBlockComments(code: string): string {
    return code.replace(/\/\*.*?\*\//gs, comment => this.blankify(comment));
  }

  stripLineComments(code: string): string {
    return code.replace(/(\/\/|#).*\n/g, comment => this.blankify(comment));
  }

  private blankify(comment: string) {
    return comment.replace(/[^\t\r\n]/g, ' ');
  }
}
