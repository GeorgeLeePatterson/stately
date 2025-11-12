export type AnyRecord = Record<string, unknown>;
export type EmptyRecord = {};

export type StringKeys<T> = Extract<keyof T, string>;
export type LiteralKeys<T> =
  StringKeys<T> extends infer Keys
    ? string extends Keys
      ? never
      : Keys
    : never;

export type UnionToIntersection<U> = (
  U extends any ? (arg: U) => void : never
) extends (arg: infer I) => void
  ? I
  : never;
