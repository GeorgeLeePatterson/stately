import type { ComponentType } from 'react';
import type { CoreSchemas } from '@/core';
import type { EditFieldProps, ViewFieldProps } from '@/core/components/fields';
import type { ComponentRegistry } from './runtime';
import { StatelyConfig } from '@stately/schema/schema';

export type RegistryMode = 'edit' | 'view';
export type RegistryKey = `${string}::${RegistryMode}` | `${string}::${RegistryMode}::${string}`;

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

export function getComponent<Schema extends CoreSchemas = CoreSchemas>(
  registry: ComponentRegistry,
  key: string,
): ComponentType<any> | undefined {
  const comp = registry.get(key);
  if (!comp) {
    console.error(`Component not found for key: ${key}`);
    return;
  }
  return comp;
}

export function getComponentByPath<Schema extends CoreSchemas = CoreSchemas>(
  registry: ComponentRegistry,
  node: string,
  path: string[],
): ComponentType<any> | undefined {
  return getComponent<Schema>(registry, [node, ...path].join('::'));
}

export function getEditComponent<
  Schema extends CoreSchemas = CoreSchemas,
  N extends Schema['AnyNode'] = Schema['AnyNode'],
  V = unknown,
>(
  registry: ComponentRegistry,
  node: string,
): ComponentType<EditFieldProps<Schema, N, V>> | undefined {
  return getComponent<Schema>(registry, makeRegistryKey(node, 'edit')) as ComponentType<
    EditFieldProps<Schema, N, V>
  >;
}

export function getViewComponent<Schema extends CoreSchemas = CoreSchemas>(
  registry: ComponentRegistry,
  node: string,
): ComponentType<ViewFieldProps<Schema>> | undefined {
  return getComponent<Schema>(registry, makeRegistryKey(node, 'view')) as ComponentType<
    ViewFieldProps<Schema>
  >;
}

export function getEditTransformer<Schema extends CoreSchemas = CoreSchemas>(
  registry: ComponentRegistry,
  node: string,
  discriminator: string,
): ComponentType<ViewFieldProps<Schema>> | undefined {
  return getComponent<Schema>(registry, makeRegistryKey(node, 'edit', discriminator)) as ComponentType<
    ViewFieldProps<Schema>
  >;
}

export function getViewTransformer<Schema extends CoreSchemas = CoreSchemas>(
  registry: ComponentRegistry,
  node: string,
  discriminator: string,
): ComponentType<ViewFieldProps<Schema>> | undefined {
  return getComponent<Schema>(registry, makeRegistryKey(node, 'view', discriminator)) as ComponentType<
    ViewFieldProps<Schema>
  >;
}
