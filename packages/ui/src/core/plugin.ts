import type { StatelyConfig } from "@stately/schema";
import { CoreNodeType } from "@stately/schema/core/nodes";
import * as editFields from "@/core/components/fields/edit";
import * as viewFields from "@/core/components/fields/view";
import * as linkFields from "@/core/components/views/link";
import type { AnyRecord, EmptyRecord } from "@/core/types";
import { makeRegistryKey } from "@/plugin";
import {
  registerUiPlugin,
  type ComponentRegistry,
  type StatelyUiPluginDescriptor,
  type StatelyUiPluginFactory,
  type StatelyRuntime,
} from "@/runtime";

export function createCoreUiPlugin<
  TConfig extends StatelyConfig = StatelyConfig,
  IExt extends AnyRecord = AnyRecord,
  PExt extends AnyRecord = EmptyRecord,
>(): StatelyUiPluginFactory<TConfig, IExt, PExt> {
  return (runtime: StatelyRuntime<TConfig, IExt, PExt>) => {
    registerCoreComponents(runtime.registry.components);

    const descriptor: StatelyUiPluginDescriptor<TConfig> = {
      name: "stately:ui-core",
      api: runtime.http,
    };

    return registerUiPlugin(runtime, descriptor);
  };
}

function registerCoreComponents(registry: ComponentRegistry) {
  const NodeType = CoreNodeType;
  registry.set(makeRegistryKey(NodeType.Array, "edit"), editFields.ArrayEdit);
  registry.set(makeRegistryKey(NodeType.Array, "view"), viewFields.ArrayView);

  registry.set(makeRegistryKey(NodeType.Enum, "edit"), editFields.EnumEdit);
  registry.set(
    makeRegistryKey(NodeType.Enum, "view"),
    viewFields.PrimitiveView,
  );

  registry.set(makeRegistryKey(NodeType.Map, "edit"), editFields.MapEdit);
  registry.set(makeRegistryKey(NodeType.Map, "view"), viewFields.MapView);

  registry.set(
    makeRegistryKey(NodeType.Nullable, "edit"),
    editFields.NullableEdit,
  );
  registry.set(
    makeRegistryKey(NodeType.Nullable, "view"),
    viewFields.NullableView,
  );

  registry.set(makeRegistryKey(NodeType.Object, "edit"), editFields.ObjectEdit);
  registry.set(makeRegistryKey(NodeType.Object, "view"), viewFields.ObjectView);

  registry.set(
    makeRegistryKey(NodeType.Primitive, "edit"),
    editFields.PrimitiveEdit,
  );
  registry.set(
    makeRegistryKey(NodeType.Primitive, "view"),
    viewFields.PrimitiveView,
  );

  registry.set(
    makeRegistryKey(NodeType.RecursiveRef, "edit"),
    editFields.RecursiveRefEdit,
  );
  registry.set(
    makeRegistryKey(NodeType.RecursiveRef, "view"),
    viewFields.RecursiveRefView,
  );

  registry.set(makeRegistryKey(NodeType.Tuple, "edit"), editFields.TupleEdit);
  registry.set(makeRegistryKey(NodeType.Tuple, "view"), viewFields.TupleView);

  registry.set(
    makeRegistryKey(NodeType.TaggedUnion, "edit"),
    editFields.TaggedUnionEdit,
  );
  registry.set(
    makeRegistryKey(NodeType.TaggedUnion, "view"),
    viewFields.TaggedUnionView,
  );

  registry.set(
    makeRegistryKey(NodeType.UntaggedEnum, "edit"),
    editFields.UntaggedEnumEdit,
  );
  registry.set(
    makeRegistryKey(NodeType.UntaggedEnum, "view"),
    viewFields.UntaggedEnumView,
  );

  registry.set(makeRegistryKey(NodeType.Link, "edit"), linkFields.LinkEdit);
  registry.set(makeRegistryKey(NodeType.Link, "view"), linkFields.LinkView);
}
