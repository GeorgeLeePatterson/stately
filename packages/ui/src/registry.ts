import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import type { EditFieldProps, ViewFieldProps } from './components/fields';
import type { ComponentsEntry, KeyGrammar } from './plugin';
import type { ComponentRegistry } from './runtime';

export function getComponent<Config extends StatelyConfig = StatelyConfig>(
  registry: ComponentRegistry,
  key: string,
): ComponentsEntry<Config>[KeyGrammar] | undefined {
  const comp = registry.get(key);
  if (!comp) {
    console.error(`Component not found for key: ${key}`);
    return;
  }
  return comp;
}

export function getComponentByPath<Config extends StatelyConfig = StatelyConfig>(
  registry: ComponentRegistry,
  node: string,
  path: string[],
): ComponentsEntry<Config>[KeyGrammar] | undefined {
  return getComponent<Config>(registry, [node, ...path].join(':'));
}

export function getEditComponent<
  Config extends StatelyConfig = StatelyConfig,
  N extends StatelySchemas<Config>['AnySchemaNode'] = StatelySchemas<Config>['AnySchemaNode'],
  V = unknown,
>(
  registry: ComponentRegistry,
  node: string,
): React.ComponentType<EditFieldProps<Config, N, V>> | undefined {
  return getComponent<Config>(registry, `${node}:edit`) as React.ComponentType<
    EditFieldProps<Config, N, V>
  >;
}

export function getViewComponent<Config extends StatelyConfig = StatelyConfig>(
  registry: ComponentRegistry,
  node: string,
): React.ComponentType<ViewFieldProps<Config>> | undefined {
  return getComponent<Config>(registry, `${node}:view`) as React.ComponentType<
    ViewFieldProps<Config>
  >;
}

export function getEditTransformer<Config extends StatelyConfig = StatelyConfig>(
  registry: ComponentRegistry,
  node: string,
  discriminator: string,
): React.ComponentType<ViewFieldProps<Config>> | undefined {
  return getComponent<Config>(registry, `${node}:edit:${discriminator}`) as React.ComponentType<
    ViewFieldProps<Config>
  >;
}

export function getViewTransformer<Config extends StatelyConfig = StatelyConfig>(
  registry: ComponentRegistry,
  node: string,
  discriminator: string,
): ComponentsEntry<Config>[KeyGrammar] | undefined {
  return getComponent<Config>(registry, `${node}:view:${discriminator}`) as React.ComponentType<
    ViewFieldProps<Config>
  >;
}
