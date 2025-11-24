import { ArrayView } from './array-field';
import { MapView } from './map-field';
import { NullableView } from './nullable-field';
import { ObjectView } from './object-field';
import { PrimitiveView } from './primitive-field';
import { RecursiveRefView } from './recursive-ref-field';
import { TaggedUnionView } from './tagged-union-field';
import { TupleView } from './tuple-field';
import { UntaggedEnumView } from './untagged-enum-field';

export type * from './array-field';
export type * from './map-field';
export type * from './nullable-field';
export type * from './object-field';
export type * from './primitive-field';
export type * from './recursive-ref-field';
export type * from './tagged-union-field';
export type * from './tuple-field';
export type * from './untagged-enum-field';

export const ViewFields = {
  ArrayView,
  MapView,
  NullableView,
  ObjectView,
  PrimitiveView,
  RecursiveRefView,
  TaggedUnionView,
  TupleView,
  UntaggedEnumView,
};
