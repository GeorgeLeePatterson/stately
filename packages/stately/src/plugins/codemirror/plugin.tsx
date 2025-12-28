/**
 * CodeMirror Plugin
 *
 * Enables CodeMirror as a string input mode in Stately forms. This plugin
 * provides syntax-highlighted code editing for string fields.
 *
 * ## Usage
 *
 * ```typescript
 * import { codemirror } from '@statelyjs/stately/plugins';
 *
 * // Enable with defaults
 * codemirror.enable();
 *
 * // Or with configuration
 * codemirror.enable({
 *   themes: { includeDefaults: true },
 *   languages: ['yaml', 'json', 'bash'],
 *   mode: { label: 'Source Code' },
 * });
 * ```
 *
 * ## Peer Dependencies
 *
 * You must install CodeMirror packages in your project:
 *
 * ```bash
 * pnpm add @uiw/react-codemirror @uiw/codemirror-extensions-basic-setup @uiw/codemirror-extensions-langs
 * ```
 *
 * For themes, install the theme packages you want:
 *
 * ```bash
 * pnpm add @uiw/codemirror-theme-github  # Required (default theme)
 * pnpm add @uiw/codemirror-theme-vscode @uiw/codemirror-theme-gruvbox-dark  # Optional
 * ```
 *
 * ## Direct Component Access
 *
 * For components that need CodeMirror directly (not through string field modes):
 *
 * ```typescript
 * import { codemirror } from '@statelyjs/stately/plugins';
 *
 * function MyEditor() {
 *   const CodeMirror = codemirror.useComponent();
 *   if (!CodeMirror) return <div>Enable codemirror first</div>;
 *   return <CodeMirror value={value} onChange={onChange} />;
 * }
 * ```
 *
 * @packageDocumentation
 */

import { EditorWrapper, type EditorWrapperProps } from '@statelyjs/ui/components/editor';
import { createFeaturePlugin } from '@statelyjs/ui/feature-plugin';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import { Code } from 'lucide-react';
import {
  CORE_STRING_MODE_GROUP,
  type StringMode,
  stringModes,
} from '@/core/extensions/add-string-modes';
import { CodemirrorEditor, type CodemirrorEditorBaseProps } from './editor';
import { setLazyCodemirror } from './toggled';

/**
 * Default string mode configuration
 */
export const defaultCodemirrorStringMode: StringMode = {
  description: 'Syntax highlighted',
  icon: Code,
  label: 'Code',
  value: 'code',
};

/**
 * Configuration options for the CodeMirror plugin.
 */
export interface CodemirrorPluginOptions {
  /**
   * Override props for the CodeMirror editor component.
   */
  codemirrorProps?: Partial<CodemirrorEditorBaseProps>;

  /**
   * Provide props for the editor wrapping component.
   */
  editorWrapperProps?: EditorWrapperProps;

  /**
   * Customize or override how the mode appears in the string field dropdown.
   *
   * @default {@link defaultCodemirrorStringMode}
   */
  mode?: Partial<StringMode>;

  /**
   * Set a custom mode group for the editor. If any existing mode groups are provided,
   * the editor will appear in that mode group's list.
   *
   * @default 'Text Entry'
   */
  modeGroup?: string;
}

/**
 * CodeMirror feature plugin.
 *
 * Provides syntax-highlighted code editing for string fields.
 *
 * @example Basic usage
 * ```typescript
 * import { codemirror } from '@statelyjs/stately/plugins';
 *
 * // Enable at app startup
 * codemirror.enable();
 * ```
 *
 * @example With configuration
 * ```typescript
 * codemirror.enable({
 *   mode: { label: 'Source Code' },
 *   modeGroup: 'Advanced Editing',
 * });
 * ```
 *
 * @example Direct component access
 * ```typescript
 * function QueryEditor() {
 *   const CodeMirror = codemirror.useComponent();
 *   // ...
 * }
 * ```
 */
export const codemirror = createFeaturePlugin<CodemirrorPluginOptions, ReactCodeMirrorProps>({
  // Lazy load the heavy CodeMirror component
  component: () => import('@uiw/react-codemirror'),

  // Default options
  defaults: { modeGroup: CORE_STRING_MODE_GROUP },
  id: 'codemirror',

  // Setup runs once on .enable()
  setup: (ctx, options) => {
    const modeGroup = options?.modeGroup ?? CORE_STRING_MODE_GROUP;
    const stringMode: StringMode = { ...defaultCodemirrorStringMode, ...(options?.mode ?? {}) };
    const modeValue = stringMode.value;

    // Set the lazy component for CodemirrorEditorToggle
    if (ctx.Component) {
      setLazyCodemirror(ctx.Component);
    }

    // Define component outside the extend callback to maintain stable reference
    const CodemirrorComponent: React.FC<{
      value: unknown;
      onChange?: (value: string) => void;
      placeholder?: string;
    }> = props => {
      // ctx.Component is guaranteed to exist when this renders (plugin is enabled)
      const LazyCodeMirror = ctx.Component;
      if (LazyCodeMirror === null) return null;
      return (
        <EditorWrapper {...options?.editorWrapperProps}>
          <CodemirrorEditor
            {...options?.codemirrorProps}
            Codemirror={LazyCodeMirror}
            content={(props.value as string) ?? ''}
            onContent={val => props.onChange?.(val)}
            placeholder={props.placeholder ?? 'Enter code...'}
          />
        </EditorWrapper>
      );
    };

    // Extend string modes with the new deep merge API
    stringModes.extend(state => ({
      component: state.modeState.mode === modeValue ? CodemirrorComponent : state.component,
      modeState: {
        mode: state.modeState.mode,
        modeGroups: [
          // If mode groups align, merge them
          ...state.modeState.modeGroups.map(g =>
            g.name === modeGroup ? { modes: [...g.modes, stringMode], name: g.name } : g,
          ),
          // Otherwise, add a new group
          ...(state.modeState.modeGroups.some(g => g.name === modeGroup)
            ? []
            : [{ modes: [stringMode], name: modeGroup }]),
        ],
      },
    }));
  },
});
