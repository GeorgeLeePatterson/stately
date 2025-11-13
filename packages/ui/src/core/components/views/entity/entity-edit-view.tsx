import { FileJson, FormInput, WandSparkles } from "lucide-react";
import { useState } from "react";
import type { CoreObjectNode, CoreSchemas } from "@/core";
import { FieldGroup } from "@/core/components/ui/field";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/components/ui/tabs";
import { EntityFormEdit } from "./entity-form-edit";
import { EntityWizardView } from "./entity-wizard-view";
import { AnyRecord } from "@stately/schema/helpers";
import { JsonView } from "@/base/form/json-view";
import { JsonEdit } from "@/base/form/json-edit";

export enum EditMode {
  FORM = "Form",
  JSON = "JSON",
  WIZARD = "Wizard",
}

export interface EntityEditViewProps<Schema extends CoreSchemas = CoreSchemas> {
  node: CoreObjectNode<Schema>;
  value: any; // Current entity data (from parent)
  defaultMode?: EditMode;
  onChange: (data: AnyRecord) => void;
  onSave?: () => void;
  isRootEntity?: boolean;
  isLoading?: boolean;
}

/**
 * EntityEditView - coordinator component that maps entity schema to field components
 * Does not maintain its own state - just passes through to child field components
 */
export function EntityEditView<Schema extends CoreSchemas = CoreSchemas>({
  node,
  value,
  defaultMode,
  onChange,
  onSave,
  isRootEntity,
  isLoading,
}: EntityEditViewProps<Schema>) {
  const [debugOpen, setDebugOpen] = useState(false);
  return (
    <Tabs defaultValue={defaultMode || EditMode.FORM}>
      {/* Mode Toggle */}
      <TabsList>
        <TabsTrigger value={EditMode.FORM} className="cursor-pointer">
          <FormInput />
          Form
        </TabsTrigger>
        <TabsTrigger value={EditMode.WIZARD} className="cursor-pointer">
          <WandSparkles />
          Wizard
        </TabsTrigger>
        <TabsTrigger value={EditMode.JSON} className="cursor-pointer">
          <FileJson />
          JSON
        </TabsTrigger>
      </TabsList>
      {/* Form or JSON Editor */}
      <TabsContent value={EditMode.FORM}>
        <div className="space-y-5 min-w-0 p-2">
          <EntityFormEdit
            node={node}
            value={value}
            onChange={onChange}
            isRootEntity={isRootEntity}
            isLoading={isLoading}
          />
          {/*View json configuration*/}
          {!!value && Object.keys(value).length > 0 && (
            <JsonView
              data={value}
              isOpen={debugOpen}
              setIsOpen={setDebugOpen}
            />
          )}
        </div>
      </TabsContent>
      <TabsContent value={EditMode.JSON}>
        <FieldGroup className="min-w-0">
          <JsonEdit value={value} onSave={onChange} />
        </FieldGroup>
      </TabsContent>
      <TabsContent value={EditMode.WIZARD}>
        <EntityWizardView
          node={node}
          value={value}
          onChange={onChange}
          onComplete={onSave}
          isRootEntity={isRootEntity}
          isLoading={isLoading}
        />
      </TabsContent>
    </Tabs>
  );
}
