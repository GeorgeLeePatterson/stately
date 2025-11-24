import type { Transformer } from '@/base/registry';
import { EditFields, type PrimitiveStringEditTransformerProps } from './edit';
import { ViewFields } from './view';
/**
 * Transformers
 */
// Define any view transformers
// ...

// Define any edit transformers
export const defaultPrimitiveStringTransformer = (p =>
  p) as Transformer<PrimitiveStringEditTransformerProps>;

export type * from './edit';
export type * from './view';

export { EditFields, ViewFields };
