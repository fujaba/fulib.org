declare module 'ignore-file' {
  export function compile(patterns: string): (path: string) => boolean;
}
