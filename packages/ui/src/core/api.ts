/**
 * Core Plugin API
 *
 * Creates the typed API for the core plugin using the new operation system.
 */

import type { TypedOperations } from '@/base/api';
import type { CORE_OPERATIONS, CorePaths } from './schema/api';

export type CoreApi = TypedOperations<CorePaths, typeof CORE_OPERATIONS>;
