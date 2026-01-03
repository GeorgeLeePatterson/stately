/**
 * Optional feature plugins that extend Stately's capabilities.
 *
 * This module provides opt-in features that enhance the Stately UI with
 * additional functionality. Features are implemented as plugins that can
 * be selectively enabled based on your application's needs.
 *
 * @example
 * ```tsx
 * import { codemirror } from '@statelyjs/stately/features';
 *
 * // Enable CodeMirror for syntax-highlighted string editing
 * codemirror.enable();
 *
 * // Or with configuration
 * codemirror.enable({
 *   mode: { label: 'Source Code' },
 *   modeGroup: 'Advanced Editing',
 * });
 *
 * // Access the component directly
 * function QueryEditor() {
 *   const CodeMirror = codemirror.useComponent();
 *   // ...
 * }
 * ```
 *
 * @module features
 */

import { codemirror, defaultCodemirrorStringMode } from './codemirror/plugin';

export type { CodemirrorPluginOptions } from './codemirror/plugin';
export { codemirror, defaultCodemirrorStringMode };
