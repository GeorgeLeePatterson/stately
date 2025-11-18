export type AnyRecord = Record<string, unknown>;
export type NeverRecord = Record<never, never>;
export type EmptyRecord = Record<string, never>;

export type AssertTrue<T extends true> = T;

export type RequireNarrower<T, Base, Msg> = Base extends T
  ? Msg extends string
    ? `TYPE ERROR: ${Msg}`
    : 'TYPE ERROR: Expected narrower type'
  : T;

export type RequireLiteral<
  T extends string,
  Msg = 'TYPE ERROR: Value must be a string literal',
> = RequireNarrower<T, string, Msg>;

export type StringKeys<T> = Extract<keyof T, string>;
export type LiteralKeys<T> = StringKeys<T> extends infer Keys
  ? string extends Keys
    ? never
    : Keys
  : never;

export type UnionToIntersection<U> = (U extends any ? (arg: U) => void : never) extends (
  arg: infer I,
) => void
  ? I
  : never;

/** Convert an array of values to a non-readonly tuple */
export const Tuple = <T extends [any, ...any]>(v: T) => v;
