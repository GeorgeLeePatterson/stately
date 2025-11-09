/**
 * @stately/ui - Core UI Integration
 *
 * Ergonomic factory function for creating React context + hooks
 */

import type { Stately, StatelyConfig, StatelySchemas } from '@stately/schema';
import { NodeType } from '@stately/schema';
import type { AnyRecord, EmptyRecord } from '@stately/schema/helpers';
import type { Client } from 'openapi-fetch';
import * as editFields from '@/components/fields/edit';
import * as viewFields from '@/components/fields/view';
import * as linkFields from '@/components/views/link';
import * as helpers from '@/lib/helpers';
import type { StatelyApi, StatelyOperations } from '@/lib/operations';
import {
  buildOperationIndex,
  buildStatelyOperations,
  createStatelyApi,
  type OperationIndex,
} from '@/lib/operations';
import type { ComponentsEntry, ValidateUiPlugin } from './plugin.js';

/**
 * Component registry - flat string key structure
 *
 * Keys follow the pattern: 'nodeType:edit' | 'nodeType:view' | 'nodeType:edit:discriminator'
 *
 * Examples:
 *   - 'primitive:edit' -> PrimitiveField component
 *   - 'primitive:view' -> PrimitiveFieldView component
 *   - 'primitive:edit:string' -> Prop transformer function for string primitives
 */
export type ComponentRegistry = Map<string, any>;

export type StatelyRuntime<
  TConfig extends StatelyConfig,
  IExt extends AnyRecord,
  UExt extends AnyRecord,
> = {
  integration: Stately<TConfig, IExt>;
  client: Client<StatelySchemas<TConfig>['paths'] & {}>;
  operationIndex: OperationIndex<TConfig>;
  operations: StatelyOperations<TConfig>;
  api: StatelyApi<TConfig>;
  componentRegistry: ComponentRegistry;
  helpers: typeof helpers;
  extensions: UExt;
};

/**
 * This is the minimal shape your library components can always rely on.
 * It’s already concrete, using StatelyConfig/StatelySchemas<StatelyConfig>.
 */
export type StatelyCoreRuntime = StatelyRuntime<StatelyConfig, AnyRecord, AnyRecord>;

/**
 * Registry that consumers can augment.
 */
export interface StatelyUi {
  Core: StatelyCoreRuntime; // default
}

/** The core type minimal runtime type */
export type StatelyCore = StatelyUi['Core'];

type Builder<
  TConfig extends StatelyConfig,
  IExt extends AnyRecord,
  UExt extends AnyRecord,
> = StatelyRuntime<TConfig, IExt, UExt> & {
  withPlugin<C extends Partial<ComponentsEntry<TConfig>>, E extends AnyRecord = EmptyRecord>(
    plugin: ValidateUiPlugin<TConfig, C, E>,
  ): Builder<TConfig, IExt, UExt & E>;
};

/**
 * Create a StatelyUI integration with React context, provider, and hooks
 *
 * @param integration - The Stately schema integration
 * @param client - OpenAPI client for data fetching/mutations
 * @returns Object with StatelyUiProvider, useStatelyUi hook, and direct access to core objects
 *
 * @example
 * ```typescript
 * const core = createStatelyUi(integration, client).withPlugin(myPlugin);
 *
 * function App() {
 *   return (
 *     <StatelyUiProvider value={core}>
 *       <MyComponent />
 *     </StatelyUiProvider>
 *   );
 * }
 * ```
 */
export function statelyUi<TConfig extends StatelyConfig, IExt extends AnyRecord = EmptyRecord>(
  integration: Stately<TConfig, IExt>,
  client: Client<StatelySchemas<TConfig>['paths'] & {}>,
) {
  const componentRegistry: ComponentRegistry = new Map();

  // Pre-register base field components
  componentRegistry.set(`${NodeType.Array}:edit`, editFields.ArrayEdit);
  componentRegistry.set(`${NodeType.Array}:view`, viewFields.ArrayView);

  componentRegistry.set(`${NodeType.Enum}:edit`, editFields.EnumEdit);
  componentRegistry.set(`${NodeType.Enum}:view`, viewFields.PrimitiveView);

  componentRegistry.set(`${NodeType.Map}:edit`, editFields.MapEdit);
  componentRegistry.set(`${NodeType.Map}:view`, viewFields.MapView);

  componentRegistry.set(`${NodeType.Nullable}:edit`, editFields.NullableEdit);
  componentRegistry.set(`${NodeType.Nullable}:view`, viewFields.NullableView);

  componentRegistry.set(`${NodeType.Object}:edit`, editFields.ObjectEdit);
  componentRegistry.set(`${NodeType.Object}:view`, viewFields.ObjectView);

  componentRegistry.set(`${NodeType.Primitive}:edit`, editFields.PrimitiveEdit);
  componentRegistry.set(`${NodeType.Primitive}:view`, viewFields.PrimitiveView);

  componentRegistry.set(`${NodeType.RecursiveRef}:edit`, editFields.RecursiveRefEdit);
  componentRegistry.set(`${NodeType.RecursiveRef}:view`, viewFields.RecursiveRefView);

  componentRegistry.set(`${NodeType.Tuple}:edit`, editFields.TupleEdit);
  componentRegistry.set(`${NodeType.Tuple}:view`, viewFields.TupleView);

  componentRegistry.set(`${NodeType.TaggedUnion}:edit`, editFields.TaggedUnionEdit);
  componentRegistry.set(`${NodeType.TaggedUnion}:view`, viewFields.TaggedUnionView);

  componentRegistry.set(`${NodeType.UntaggedEnum}:edit`, editFields.UntaggedEnumEdit);
  componentRegistry.set(`${NodeType.UntaggedEnum}:view`, viewFields.UntaggedEnumView);

  componentRegistry.set(`${NodeType.Link}:edit`, linkFields.LinkEdit);
  componentRegistry.set(`${NodeType.Link}:view`, linkFields.LinkView);

  function makeBuilder<UExt extends AnyRecord>(
    state: StatelyRuntime<TConfig, IExt, UExt>,
  ): Builder<TConfig, IExt, UExt> {
    return {
      ...state,
      helpers: { ...state.helpers, getNodeTypeIcon: icon => helpers.getNodeTypeIcon(icon, state) },
      withPlugin<C extends Partial<ComponentsEntry<TConfig>>, E extends AnyRecord = EmptyRecord>(
        plugin: ValidateUiPlugin<TConfig, C, E>,
      ): Builder<TConfig, IExt, UExt & E> {
        // mutate the shared registry (intentional)
        for (const [key, value] of Object.entries(plugin.components)) {
          if (value) {
            componentRegistry.set(key, value);
          }
        }

        const next: StatelyRuntime<TConfig, IExt, UExt & E> = {
          ...state,
          extensions: { ...state.extensions, ...(plugin.extensions || {}) } as UExt & E,
        };

        // Recurse
        return makeBuilder(next);
      },
    };
  }

  const operationIndex = buildOperationIndex<TConfig>(integration.paths);
  const operations = buildStatelyOperations<TConfig>(operationIndex);
  const api = createStatelyApi<TConfig>(client, operations);

  const initial: StatelyRuntime<TConfig, IExt, EmptyRecord> = {
    integration,
    client,
    operationIndex,
    operations,
    api,
    componentRegistry,
    helpers,
    extensions: {} as EmptyRecord,
  };

  return makeBuilder(initial);
}

export type StatelyUiBuilder<
  TConfig extends StatelyConfig,
  IExt extends AnyRecord = EmptyRecord,
  UExt extends AnyRecord = EmptyRecord,
> = Builder<TConfig, IExt, UExt>;
