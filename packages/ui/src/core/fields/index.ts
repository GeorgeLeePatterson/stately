import type { Transformer } from '@/base/registry';
import { EditFields, type PrimitiveStringEditTransformerProps } from './edit';
import { ViewFields } from './view';

export { EditFields, ViewFields };

/**
 * Transformers
 */

// Define any view transformers
// ...

// Define any edit transformers
export const defaultPrimitiveStringTransformer = (p =>
  p) as Transformer<PrimitiveStringEditTransformerProps>;

export type { PrimitiveStringEditTransformerProps, PrimitiveStringExtra } from './edit';
