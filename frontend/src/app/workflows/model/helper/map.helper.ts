export function createMapFromAnswer(entries: any, numberOfEntries: number): Map<number, string> {
  const result = new Map<number, string>();

  for (let i = 0; i < numberOfEntries; i++) {
    result.set(i, entries[i]);
  }

  return result;
}
