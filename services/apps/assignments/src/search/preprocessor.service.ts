import {Injectable} from '@nestjs/common';

@Injectable()
export class PreprocessorService {
  preprocess(code: string): string {
    code = this.stripBlockComments(code);
    code = this.stripLineComments(code);
    return code;
  }

  stripBlockComments(code: string): string {
    return code.replace(/\/\*.*?\*\//gs, comment => {
      return comment.replace(/[^\t\r\n]/g, ' ');
    });
  }

  stripLineComments(code: string): string {
    return code.replace(/(\/\/|#).*\n/g, '\n');
  }
}
