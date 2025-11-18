import type { PluginNodeUnion } from '@stately/schema';
import type { BaseNode } from '@stately/schema/nodes';
import type { StatelySchemas } from '@stately/schema/schema';
import type { ComponentType } from 'react';
import type { EditFieldProps } from '@/base/form/field-edit';
import type { ViewFieldProps } from '@/base/form/field-view';
import { makeRegistryKey } from '@/base/plugin';

export type ComponentRegistry = Map<string, ComponentType<any>>;
export type TransformerRegistry = Map<string, Transformer<any>>;
export type FunctionRegistry = Map<string, (...args: any[]) => any>;

export type Transformer<T, U = T> = (value: T) => U extends never ? T : U;

export function getComponent(registry: ComponentRegistry, key: string): unknown | undefined {
  const comp = registry.get(key);
  if (!comp) {
    console.error(`Component not found for key: ${key}`);
    return;
  }
  return comp;
}

export function getTransformer<T>(
  registry: TransformerRegistry,
  key: string,
): Transformer<T> | undefined {
  const comp = registry.get(key);
  if (!comp) {
    console.error(`Transformer not found for key: ${key}`);
    return;
  }
  return comp as Transformer<T>;
}

export function getComponentByPath(
  registry: ComponentRegistry,
  node: string,
  path: string[],
): ComponentType<any> | undefined {
  return getComponent(registry, [node, ...path].join('::')) as ComponentType<any>;
}

export function getTransformerByPath<T>(
  registry: TransformerRegistry,
  node: string,
  path: string[],
): Transformer<any> | undefined {
  return getTransformer<T>(registry, [node, ...path].join('::')) as Transformer<T>;
}

export function getEditComponent<
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends BaseNode = PluginNodeUnion<S>,
  V = unknown,
>(
  registry: ComponentRegistry,
  node: string,

  state?: string,
): ComponentType<EditFieldProps<S, N, V>> | undefined {
  return getComponent(registry, makeRegistryKey(node, 'edit', 'component', state)) as ComponentType<
    EditFieldProps<S, N, V>
  >;
}

export function getViewComponent<
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends BaseNode = PluginNodeUnion<S>,
  V = unknown,
>(
  registry: ComponentRegistry,
  node: string,
  state?: string,
): ComponentType<ViewFieldProps<S, N, V>> | undefined {
  return getComponent(registry, makeRegistryKey(node, 'view', 'component', state)) as ComponentType<
    ViewFieldProps<S, N, V>
  >;
}

export type TransformerEditProps<
  T extends {} = Record<string, any>,
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends BaseNode = PluginNodeUnion<S>,
  V = unknown,
> = EditFieldProps<S, N, V> & { extra?: T };

export function getEditTransformer<
  T extends {} = Record<string, any>,
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends BaseNode = PluginNodeUnion<S>,
  V = unknown,
>(
  registry: TransformerRegistry,
  node: string,
  state?: string,
): Transformer<TransformerEditProps<T, S, N, V>> | undefined {
  return getTransformer<TransformerEditProps<T, S, N, V>>(
    registry,
    makeRegistryKey(node, 'edit', 'transformer', state),
  );
}

export type TransformerViewProps<
  T extends {} = Record<string, any>,
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends BaseNode = PluginNodeUnion<S>,
  V = unknown,
> = ViewFieldProps<S, N, V> & { extra?: T };

export function getViewTransformer<
  T extends {} = Record<string, any>,
  S extends StatelySchemas<any, any> = StatelySchemas<any, any>,
  N extends BaseNode = PluginNodeUnion<S>,
  V = unknown,
>(
  registry: TransformerRegistry,
  node: string,
  state?: string,
): Transformer<TransformerViewProps<T, S, N, V>> | undefined {
  return getTransformer<TransformerViewProps<T, S, N, V>>(
    registry,
    makeRegistryKey(node, 'view', 'transformer', state),
  );
}
