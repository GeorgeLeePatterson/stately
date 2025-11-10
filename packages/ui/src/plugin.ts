/**
 * @stately/ui - Registry grammar helpers
 */

import type { NodeType, StatelyConfig } from '@stately/schema';
import type { ComponentType } from 'react';
import type { EditFieldProps, ViewFieldProps } from './core/components/fields/types';

export type CoreNode = `${(typeof NodeType)[keyof typeof NodeType]}`;
export type RegistryMode = 'edit' | 'view';
export type RegistryKey = `${string}::${RegistryMode}` | `${string}::${RegistryMode}::${string}`;
export type CoreRegistryKey =
  | `${CoreNode}::${RegistryMode}`
  | `${CoreNode}::${RegistryMode}::${string}`;

export type NodeTypeComponent<C extends StatelyConfig = StatelyConfig> =
  | ComponentType<EditFieldProps<C>>
  | ComponentType<ViewFieldProps<C>>;

export function makeRegistryKey(
  node: string,
  mode: RegistryMode,
  discriminator?: string,
): RegistryKey {
  return discriminator ? `${node}::${mode}::${discriminator}` : `${node}::${mode}`;
}

export function splitRegistryKey(key: RegistryKey): {
  node: string;
  mode: RegistryMode;
  discriminator?: string;
} {
  const [node, mode, discriminator] = key.split('::');
  return { node, mode: mode as RegistryMode, discriminator };
}
