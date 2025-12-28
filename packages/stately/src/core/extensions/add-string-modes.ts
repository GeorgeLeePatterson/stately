/**
 * Extension Point: addStringModes
 *
 * Allows plugins to add custom input modes to string primitive fields.
 *
 * ## Context
 *
 * - **Node Type**: Primitive (string)
 * - **Mode**: Edit
 * - **Location**: The mode dropdown in string input fields
 *
 * ## What You Can Do
 *
 * - Add new input modes (like 'upload', 'code', 'markdown')
 * - Provide a custom component that renders when your mode is selected
 * - Group your modes under a labeled section in the dropdown
 *
 * ## Example
 *
 * ```typescript
 * import { stringModes } from '@statelyjs/stately/core/extensions';
 *
 * // Extend with partial - no need to spread state
 * stringModes.extend(state => ({
 *   component: state.modeState.mode === 'code' ? CodeEditor : state.component,
 *   modeState: {
 *     mode: state.modeState.mode,
 *     modeGroups: [...state.modeState.modeGroups, myModeGroup],
 *   },
 * }));
 * ```
 *
 * @packageDocumentation
 */

import { createExtensible } from '@statelyjs/ui';
import { FileText, Link as LinkIcon, Type } from 'lucide-react';
import type { ComponentType } from 'react';

/**
 * Configuration for a single input mode option.
 */
export interface StringMode {
  /** Unique value for this mode */
  value: string;
  /** Display label in the dropdown */
  label: string;
  /** Icon component shown in the dropdown and trigger */
  icon: ComponentType<any>;
  /** Brief description shown in the dropdown */
  description: string;
}

/**
 * A group of related modes shown together in the dropdown.
 */
export interface StringModeGroup {
  /** Group label shown as a section header */
  name: string;
  /** Modes in this group */
  modes: StringMode[];
}

/**
 * State of components currently active mode and current mode groups
 */
export interface StringModeState {
  /** Currently selected mode */
  mode: string;
  /** All available mode groups (additive - add yours to this array) */
  modeGroups: StringModeGroup[];
}

/**
 * Props passed to custom mode components.
 */
export interface StringModeComponentProps {
  formId: string;
  value: string | number | null | undefined;
  onChange: (value: string | number | null | undefined) => void;
  placeholder?: string;
}

/**
 * Options passed to the useStringModes hook.
 */
export interface StringModeOptions extends StringModeComponentProps {
  /** Currently selected mode */
  mode: string;
}

/**
 * State that flows through the stringModes extension.
 *
 * Transformers receive this state and return a partial to be merged.
 */
export interface StringEditState extends Omit<StringModeOptions, 'mode'> {
  /** String mode state */
  modeState: StringModeState;

  /** Custom component to render (set when your mode is active) */
  component?: ComponentType<StringModeComponentProps>;
}

/**
 * Core string mode group
 */
export const CORE_STRING_MODE_GROUP = 'Text Entry';

/**
 * Core string input modes available by default.
 *
 * These are always included. Plugins add additional modes via `stringModes.extend()`.
 */
export const CORE_STRING_MODES: StringModeGroup = {
  modes: [
    { description: 'Plain text', icon: Type, label: 'Text', value: 'text' },
    { description: 'Web address', icon: LinkIcon, label: 'URL', value: 'url' },
    { description: 'Multi-line text', icon: FileText, label: 'Multi-line', value: 'multiline' },
  ],
  name: CORE_STRING_MODE_GROUP,
};

/**
 * Extensible hook for string field input modes.
 *
 * Use this to add new ways for users to input string values, such as:
 * - File uploads
 * - Code editors with syntax highlighting
 * - Markdown editors
 * - Color pickers
 * - Date/time pickers
 *
 * ## Using in Components
 *
 * ```typescript
 * const { modeState, component } = useStringModes({
 *   formId,
 *   value,
 *   onChange,
 *   mode: selectedMode,
 * });
 * ```
 *
 * ## Extending (from plugins)
 *
 * ```typescript
 * import { stringModes } from '@statelyjs/stately/core/extensions';
 *
 * // No need to spread state - deep merge handles it
 * stringModes.extend(state => ({
 *   component: state.modeState.mode === 'code' ? CodeEditor : state.component,
 *   modeState: {
 *     mode: state.modeState.mode,
 *     modeGroups: [...state.modeState.modeGroups, myModeGroup],
 *   },
 * }));
 * ```
 *
 * NOTE: To add a mode to an existing group, ensure the mode group name matches.
 */
export const [useStringModes, stringModes] = createExtensible<StringModeOptions, StringEditState>({
  id: 'core.stringModes',
  initial: options => ({
    component: undefined,
    formId: options.formId,
    modeState: { mode: options.mode, modeGroups: [CORE_STRING_MODES] },
    onChange: options.onChange,
    placeholder: options.placeholder,
    value: options.value,
  }),
  summary: 'Add custom input modes to string fields',
});
