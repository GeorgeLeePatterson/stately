import type { ComponentType } from 'react';
import type { AnyBaseSchemas, BaseSchemas } from '@/base';
import type { EditFieldProps } from '@/base/form/field-edit';
import type { ViewFieldProps } from '@/base/form/field-view';
import { makeRegistryKey } from '@/plugin';
import type { ComponentRegistry } from './runtime';

export function getComponent(
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

export function getComponentByPath(
  registry: ComponentRegistry,
  node: string,
  path: string[],
): ComponentType<any> | undefined {
  return getComponent(registry, [node, ...path].join('::'));
}

export function getEditComponent<
  S extends AnyBaseSchemas = BaseSchemas,
  N extends S['plugin']['AnyNode'] = S['plugin']['AnyNode'],
  V = unknown,
>(registry: ComponentRegistry, node: string): ComponentType<EditFieldProps<S, N, V>> | undefined {
  return getComponent(registry, makeRegistryKey(node, 'edit')) as ComponentType<
    EditFieldProps<S, N, V>
  >;
}

export function getViewComponent<S extends AnyBaseSchemas = BaseSchemas>(
  registry: ComponentRegistry,
  node: string,
): ComponentType<ViewFieldProps<S>> | undefined {
  return getComponent(registry, makeRegistryKey(node, 'view')) as ComponentType<ViewFieldProps<S>>;
}

export function getEditTransformer<S extends AnyBaseSchemas = BaseSchemas>(
  registry: ComponentRegistry,
  node: string,
  discriminator: string,
): ComponentType<ViewFieldProps<S>> | undefined {
  return getComponent(registry, makeRegistryKey(node, 'edit', discriminator)) as ComponentType<
    ViewFieldProps<S>
  >;
}

export function getViewTransformer<S extends AnyBaseSchemas = BaseSchemas>(
  registry: ComponentRegistry,
  node: string,
  discriminator: string,
): ComponentType<ViewFieldProps<S>> | undefined {
  return getComponent(registry, makeRegistryKey(node, 'view', discriminator)) as ComponentType<
    ViewFieldProps<S>
  >;
}
