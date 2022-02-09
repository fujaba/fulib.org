export interface GenerateResult {
  board: string,
  pages: Map<number, string>,
  numberOfPages: number,
  diagrams: Map<number, string>,
  numberOfDiagrams: number,
  fxmls: Map<number, string>,
  numberOfFxmls: number,
  classDiagram: string,
}
