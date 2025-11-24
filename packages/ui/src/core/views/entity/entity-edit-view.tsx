import type { Schemas } from '@stately/schema';
import type { AnyRecord } from '@stately/schema/helpers';
import { FileJson, FormInput, WandSparkles } from 'lucide-react';
import { useState } from 'react';
import { JsonEdit } from '@/base/form/json-edit';
import { JsonView } from '@/base/form/json-view';
import { FieldGroup } from '@/base/ui/field';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/base/ui/tabs';
import { EntityFormEdit } from './entity-form-edit';
import { EntityWizardEdit } from './entity-wizard-view';

export enum EditMode {
  FORM = 'Form',
  JSON = 'JSON',
  WIZARD = 'Wizard',
}

export interface EntityEditViewProps<Schema extends Schemas = Schemas> {
  node: Schema['plugin']['Nodes']['object'];
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
export function EntityEditView<Schema extends Schemas = Schemas>({
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
        <TabsTrigger className="cursor-pointer" value={EditMode.FORM}>
          <FormInput />
          Form
        </TabsTrigger>
        <TabsTrigger className="cursor-pointer" value={EditMode.WIZARD}>
          <WandSparkles />
          Wizard
        </TabsTrigger>
        <TabsTrigger className="cursor-pointer" value={EditMode.JSON}>
          <FileJson />
          JSON
        </TabsTrigger>
      </TabsList>
      {/* Form or JSON Editor */}
      <TabsContent value={EditMode.FORM}>
        <div className="space-y-5 min-w-0 p-2">
          <EntityFormEdit
            isLoading={isLoading}
            isRootEntity={isRootEntity}
            node={node}
            onChange={onChange}
            value={value}
          />
          {/*View json configuration*/}
          {!!value && Object.keys(value).length > 0 && (
            <JsonView data={value} isOpen={debugOpen} setIsOpen={setDebugOpen} />
          )}
        </div>
      </TabsContent>
      <TabsContent value={EditMode.JSON}>
        <FieldGroup className="min-w-0 py-3">
          <JsonEdit onSave={onChange} value={value} />
        </FieldGroup>
      </TabsContent>
      <TabsContent value={EditMode.WIZARD}>
        <EntityWizardEdit
          isLoading={isLoading}
          isRootEntity={isRootEntity}
          node={node}
          onChange={onChange}
          onComplete={onSave}
          value={value}
        />
      </TabsContent>
    </Tabs>
  );
}
