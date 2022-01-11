import {Injectable} from '@nestjs/common';

const JAVA_KEYWORDS = new Set(`abstract continue for new switch assert default goto package synchronized boolean do if private this \
break implements protected throw else import public throws case enum instanceof return transient catch extends try \
final interface static void class finally strictfp volatile const native super while`.split(' '));

@Injectable()
export class PreprocessorService {
  preprocess(code: string): string {
    code = this.stripBlockComments(code);
    code = this.stripLineComments(code);
    return code;
  }

  stripBlockComments(code: string): string {
    return code.replace(/\/\*.*?\*\//gs, comment => {
      return comment.replace(/[^ \r\n]/g, ' ');
    });
  }

  stripLineComments(code: string): string {
    return code.replace(/(\/\/|#).*\n/g, '\n');
  }

  renameJavaVariables(code: string): string {
    const remapping = new Map<string, string>();
    const typeIndex = new Map<string, number>();
    code = code.replace(/([a-zA-Z0-9$_<>\[\]]+)(\s+)([a-zA-Z0-9$_]{2,})/g, (decl, type, space, name) => {
      if (JAVA_KEYWORDS.has(type)) {
        return decl;
      }
      const shortType = type.charAt(0).toLowerCase();
      const index = typeIndex.get(shortType) ?? 0;
      typeIndex.set(shortType, index + 1);
      const indexStr = index.toString(36);
      const newName = shortType + indexStr;
      remapping.set(name, newName);
      return type + space + newName.padEnd(name.length, ' ');
    });
    code = code.replace(/([a-zA-Z0-9$_]{2,})/g, name => remapping.get(name)?.padEnd(name.length, ' ') ?? name);
    return code;
  }
}
