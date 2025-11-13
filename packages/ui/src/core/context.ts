import { createUseStatelyUi } from '@/context';
import type { CoreSchemas, CoreUiAugment } from './plugin';

/**
 * Typed hook for accessing CoreStatelyRuntime in components.
 * Use this in all core components instead of the untyped useStatelyUi hook.
 *
 * @example
 * ```typescript
 * function MyComponent<Schema extends CoreSchemas>() {
 *   const runtime = useCoreStatelyUi<Schema>();
 *   runtime.plugins.core // ✓ Fully typed!
 * }
 * ```
 */

// TODO: Remove
// export function useCoreStatelyUi<
//   S extends CoreSchemas = CoreSchemas,
//   ExtraAugments extends readonly UiAugment<string, S, any, any>[] = readonly [],
// >() {
//   const useCoreStatelyUi = createUseStatelyUi<CoreSchemas, readonly [CoreUiAugment<S>]>();
// }

export const useCoreStatelyUi = createUseStatelyUi<CoreSchemas, readonly [CoreUiAugment]>();
