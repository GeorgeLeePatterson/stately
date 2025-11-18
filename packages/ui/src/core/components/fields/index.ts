import type { Transformer } from '@/base/registry';
import * as edit from './edit';
import * as view from './view';

/**
 * Transformers
 */
// Define any view transformers
// ...

// Define any edit transformers
import type { PrimitiveStringEditTransformerProps } from './edit';
export type { PrimitiveStringEditTransformerProps };
export const defaultPrimitiveStringTransformer = (p =>
  p) as Transformer<PrimitiveStringEditTransformerProps>;

export { view, edit };
