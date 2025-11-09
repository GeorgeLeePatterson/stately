/**
 * @stately/ui - Plugin System
 *
 * Defines the plugin interface for extending Stately UI
 */

import type { NodeType, StatelyConfig } from '@stately/schema';
import type { AnyRecord, EmptyRecord } from '@stately/schema/helpers';
import type { EditFieldProps, ViewFieldProps } from './components/fields/types';

export type CoreNode = `${(typeof NodeType)[keyof typeof NodeType]}`;

// Build the base "nodeType" union from your const
export type Mode = 'edit' | 'view';

// `${node}:${mode}` OR `${node}:edit:${discriminator}`
export type KeyGrammar =
  | `${string}:${Mode}`
  | `${string}:edit:${string}`
  | `${string}:view:${string}`;

// Helper type for core registry keys
export type CoreRegistryKey =
  | `${CoreNode}:${Mode}`
  | `${CoreNode}:edit:${string}`
  | `${CoreNode}:view:${string}`;

/**
 * Component registry entry
 * Maps a nodeType to its edit and view components
 */
export type NodeTypeComponents<C extends StatelyConfig = StatelyConfig> =
  | React.ComponentType<EditFieldProps<C>>
  | React.ComponentType<ViewFieldProps<C>>;

export type ComponentsEntry<C extends StatelyConfig = StatelyConfig> = Record<
  KeyGrammar,
  NodeTypeComponents<C>
>;

/**
 * UI plugin interface
 *
 * Plugins register UI components for their node types and can add:
 * - Field components (edit/view)
 * - Custom hooks
 * - Additional UI functionality
 */
export interface StatelyUiPlugin<
  TConfig extends StatelyConfig,
  Components extends Partial<ComponentsEntry<TConfig>> = EmptyRecord,
  Extensions extends AnyRecord = EmptyRecord,
> {
  /**
   * Component registry: nodeType -> { edit, view }
   */
  components: Components;
  /**
   * Additional functionality provided by this plugin
   * (hooks, utilities, etc.)
   */
  extensions: Extensions;
}

// Utility to test if K is assignable to RegistryKey (distributively)
export type KeysConformToGrammar<K> = [K] extends [never]
  ? true
  : K extends string
    ? K extends KeyGrammar
      ? true
      : false
    : false;

/**
 * Type helper: Verify plugin components match node types in integration
 * Returns never if validation fails, causing a TypeScript error
 */
export type ValidateUiPlugin<
  TConfig extends StatelyConfig,
  Components extends Partial<ComponentsEntry<TConfig>> = EmptyRecord,
  Extensions extends AnyRecord = EmptyRecord,
> = KeysConformToGrammar<
  keyof StatelyUiPlugin<TConfig, Components, Extensions>['components']
> extends true
  ? StatelyUiPlugin<TConfig, Components, Extensions>
  : never;
