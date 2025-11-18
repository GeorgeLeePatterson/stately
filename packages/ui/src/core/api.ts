/**
 * Core Plugin API
 *
 * Creates the typed API for the core plugin using the new operation system.
 */

import type { CORE_OPERATIONS, CorePaths } from '@stately/schema/core/api';
import type { TypedOperations } from '@/base/api';

export type CoreApi = TypedOperations<CorePaths, typeof CORE_OPERATIONS>;
