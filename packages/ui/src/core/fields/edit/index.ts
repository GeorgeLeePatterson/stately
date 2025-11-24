import { ArrayEdit } from './array-field';
import { EnumEdit } from './enum-field';
import { MapEdit } from './map-field';
import { NullableEdit } from './nullable-field';
import { ObjectEdit } from './object-field';
import { PrimitiveEdit } from './primitive-field';
import { RecursiveRefEdit } from './recursive-ref-field';
import { TaggedUnionEdit } from './tagged-union-field';
import { TupleEdit } from './tuple-field';
import { UntaggedEnumEdit } from './untagged-enum-field';

export type * from './array-field';
export type * from './enum-field';
export type * from './map-field';
export type * from './nullable-field';
export type * from './object-field';
export type * from './primitive-field';
export type * from './primitive-string';
export type * from './recursive-ref-field';
export type * from './tagged-union-field';
export type * from './tuple-field';
export type * from './untagged-enum-field';

export const EditFields = {
  ArrayEdit,
  EnumEdit,
  MapEdit,
  NullableEdit,
  ObjectEdit,
  PrimitiveEdit,
  RecursiveRefEdit,
  TaggedUnionEdit,
  TupleEdit,
  UntaggedEnumEdit,
};
