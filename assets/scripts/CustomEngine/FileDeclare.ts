export {}
declare global {
  interface Array<T> {
    findLast(predicate: (value: T, index: number, element: T[]) => unknown): T;
    findLastIndex(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any
    ): number;
  }
}