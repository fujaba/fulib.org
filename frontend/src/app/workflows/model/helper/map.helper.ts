export function createMapFromAnswer(pages: any, numOfPages: number): Map<number, string> {
  const result = new Map<number, string>();

  for (let i = 1; i <= numOfPages; i++) {
    result.set(i, pages[i]);
  }

  return result;
}
