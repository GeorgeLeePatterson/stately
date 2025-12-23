/**
 * Development-only assertion utilities for Stately library internals.
 *
 * These assertions help catch library bugs during development and testing
 * while avoiding crashes in production. They're designed for internal
 * invariant checking, not user input validation.
 */

import { devLog } from './logging';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Assert a condition is true in development mode.
 *
 * In development: throws an error with a detailed message and logs context.
 * In production: silently returns (does not throw or log).
 *
 * Use this for internal library invariants that should never fail if the
 * library code is correct. E2E tests running in dev mode will catch violations.
 *
 * @param condition - The condition that must be true
 * @param message - Error message describing what went wrong
 * @param context - Optional additional context for debugging
 *
 * @example
 * ```ts
 * devAssert(
 *   input.type === expectedType,
 *   `Entity type mismatch: expected "${expectedType}", got "${input.type}"`,
 *   { input, expectedType }
 * );
 * ```
 */
export function devAssert(
  condition: boolean,
  message: string,
  context?: Record<string, unknown>,
): asserts condition {
  if (!condition) {
    devLog.error('Assert', message, context);
    if (isDev) throw new Error(`[Stately] ${message}`);
  }
}
