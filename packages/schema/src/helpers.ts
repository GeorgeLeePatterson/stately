/**
 * Type Helpers
 *
 * Internal utility types used throughout the schema system.
 * These provide type-level operations for building the plugin architecture.
 */

/** A record with string keys and unknown values. */
export type AnyRecord = Record<string, unknown>;

/** An empty record with no valid keys. Used for "no data" scenarios. */
export type NeverRecord = Record<never, never>;

/** A record that exists but has no properties. */
export type EmptyRecord = Record<string, never>;

/** @internal Error message for non-literal string types. */
export type ErrorMessageStringLiteral = 'TYPE ERROR: Value must be a string literal';

/** @internal Error message for types that need to be narrower. */
export type ErrorMessageNarrowType = 'TYPE ERROR: Expected narrower type';

/** @internal Compile-time assertion that a type is true. */
export type AssertTrue<T extends true> = T;

/**
 * Requires that T is narrower than Base, otherwise returns an error message.
 * Used to enforce literal types at compile time.
 * @internal
 */
export type RequireNarrower<T, Base, Msg> = Base extends T
  ? Msg extends string
    ? `TYPE ERROR: ${Msg}`
    : ErrorMessageNarrowType
  : T;

/**
 * Enforces that a string type is a literal, not just `string`.
 * Returns a compile-time error message if given a wide string type.
 *
 * @typeParam T - The string type to check
 * @typeParam Msg - Custom error message if check fails
 */
export type RequireLiteral<T extends string, Msg = ErrorMessageStringLiteral> = RequireNarrower<
  T,
  string,
  Msg
>;

/** Extracts only string keys from a type. */
export type StringKeys<T> = Extract<keyof T, string>;

/**
 * Extracts literal string keys from a type, excluding index signatures.
 * Returns `never` if the type only has an index signature.
 */
export type LiteralKeys<T> = StringKeys<T> extends infer Keys
  ? string extends Keys
    ? never
    : Keys
  : never;

/**
 * Converts a union type to an intersection type.
 * @example `UnionToIntersection<A | B>` becomes `A & B`
 */
export type UnionToIntersection<U> = (U extends any ? (arg: U) => void : never) extends (
  arg: infer I,
) => void
  ? I
  : never;

/** Converts an array of values to a non-readonly tuple. */
export const Tuple = <T extends [any, ...any]>(v: T) => v;

/** Enforces that a type is defined (not undefined). */
export type Defined<T> = T extends undefined ? never : T;

/** Enforces that a subtype T is assignable to supertype U. */
export type Assume<T, U> = T extends U ? T : never;
