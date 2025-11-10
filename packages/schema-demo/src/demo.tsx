import React from 'react';

/**
 * Demo layout (pure types, no casts):
 * 1. stately/schema – shared contracts
 * 2. foo plugin     – schema augment definition
 * 3. bar plugin     – schema augment definition
 * 4. user app       – composes OpenAPI + generated nodes + plugins
 */

// ╔══════════════════════════════════════════════════════════════╗
// ║ 1. STATELY / SCHEMA                                          ║
// ╚══════════════════════════════════════════════════════════════╝

interface StatelyConfig {
  components: {
    schemas: {
      StateEntry: string;
      Entity: unknown;
    } & Record<string, unknown>;
  };
  paths: Record<string, unknown>;
}

type SchemaAugment<Nodes extends object> = { nodes: Nodes };

type MergeAugments<
  Augments extends readonly SchemaAugment<object>[],
  Acc extends object = {},
> = Augments extends readonly [infer Head, ...infer Tail]
  ? Head extends SchemaAugment<infer Nodes>
    ? Tail extends readonly SchemaAugment<object>[]
      ? MergeAugments<Tail, Acc & Nodes>
      : (Acc & Nodes)
    : Tail extends readonly SchemaAugment<object>[]
      ? MergeAugments<Tail, Acc>
      : Acc
  : Acc;

type CombineNodes<
  BaseNodes extends object,
  Augments extends readonly SchemaAugment<object>[],
> = BaseNodes & MergeAugments<Augments>;

type StatelySchema<
  Config extends StatelyConfig,
  BaseNodes extends object,
  Augments extends readonly SchemaAugment<object>[],
> = {
  StateEntry: Config['components']['schemas']['StateEntry'];
  Entity: Config['components']['schemas']['Entity'];
  Nodes: CombineNodes<BaseNodes, Augments>;
  AnyNode: CombineNodes<BaseNodes, Augments>[keyof CombineNodes<BaseNodes, Augments>];
};

type Schemas<
  Config extends StatelyConfig,
  BaseNodes extends object,
  Augments extends readonly SchemaAugment<object>[] = [],
> = StatelySchema<Config, BaseNodes, Augments>;

// ╔══════════════════════════════════════════════════════════════╗
// ║ 2. FOO PLUGIN                                                ║
// ╚══════════════════════════════════════════════════════════════╝

type FooNodeShape = { nodeType: 'foo'; label: string; defaultValue: number };

type FooSchemaAugment = SchemaAugment<{ FooNode: FooNodeShape }>;

type FooNodeFrom<Schema> = Schema extends { Nodes: infer Nodes }
  ? Nodes extends { FooNode: infer Node }
    ? Node
    : never
  : never;

// ╔══════════════════════════════════════════════════════════════╗
// ║ 3. BAR PLUGIN                                                ║
// ╚══════════════════════════════════════════════════════════════╝

type BarNodeShape = { nodeType: 'bar'; count: number; isActive: boolean };

type BarSchemaAugment = SchemaAugment<{ BarNode: BarNodeShape }>;

type BarNodeFrom<Schema> = Schema extends { Nodes: infer Nodes }
  ? Nodes extends { BarNode: infer Node }
    ? Node
    : never
  : never;

// ╔══════════════════════════════════════════════════════════════╗
// ║ 4. USER APP                                                  ║
// ╚══════════════════════════════════════════════════════════════╝

type DemoEntity =
  | { type: 'entity_foo'; data: { id: string; label: string } }
  | { type: 'entity_bar'; data: { id: string; count: number } };

type DemoOpenAPI = StatelyConfig & {
  components: {
    schemas: {
      StateEntry: 'entity_foo' | 'entity_bar';
      Entity: DemoEntity;
    } & Record<string, unknown>;
  };
};

const openapi: DemoOpenAPI = {
  components: {
    schemas: {
      StateEntry: 'entity_foo',
      Entity: { type: 'entity_foo', data: { id: 'foo-1', label: 'Foo' } },
    },
  },
  paths: { '/foo': { get: { operationId: 'getFoo' } } },
};

const generatedNodes = {} as const; // pretend core generated nothing

type DemoSchema = Schemas<
  typeof openapi,
  typeof generatedNodes,
  [FooSchemaAugment, BarSchemaAugment]
>;

const demoNodes: DemoSchema['Nodes'] = {
  FooNode: { nodeType: 'foo', label: 'From plugin', defaultValue: 1 },
  BarNode: { nodeType: 'bar', count: 3, isActive: true },
};

type DemoStateEntry = DemoSchema['StateEntry'];

type DemoAnyNode = DemoSchema['AnyNode'];

type AppNodeProps = {
  entry: DemoStateEntry;
  entity: DemoAnyNode;
  renderEntity: (entity: DemoAnyNode) => React.ReactNode;
};

function AppNode({ entry, entity, renderEntity }: AppNodeProps) {
  const entryLabel = entry === 'entity_foo' ? 'Foo Entry' : 'Bar Entry';
  return (
    <div>
      <div>{entryLabel}</div>
      <div>{renderEntity(entity)}</div>
    </div>
  );
}

export const DemoElement = (
  <AppNode
    entry="entity_foo"
    entity={demoNodes.FooNode}
    renderEntity={entity => {
      if (entity.nodeType === 'foo') {
        return <span>{entity.label}</span>;
      }
      if (entity.nodeType === 'bar') {
        return <span>{entity.count}</span>;
      }
      return <span>Unknown</span>;
    }}
  />
);

// Example: plugin helper usage remains typed
export type FooNode = FooNodeFrom<DemoSchema>;
export type BarNode = BarNodeFrom<DemoSchema>;
