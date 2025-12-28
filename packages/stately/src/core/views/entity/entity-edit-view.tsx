import type { AnyRecord } from '@statelyjs/schema/helpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@statelyjs/ui/components/base/tabs';
import { FileJson, FormInput, WandSparkles } from 'lucide-react';
import { useState } from 'react';
import type { Schemas } from '@/core/schema';
import { BaseForm } from '@/form';
import { EntityFormEdit } from './entity-form-edit';
import { EntityJsonView } from './entity-properties';
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
  isSingleton?: boolean;
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
  const [isJsonOpen, setIsJsonOpen] = useState(false);
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
      <div className="border-muted border-t">
        <TabsContent value={EditMode.FORM}>
          {/* Entity form */}
          <EntityFormEdit
            entity={value}
            isLoading={isLoading}
            isRootEntity={isRootEntity}
            node={node}
            onChange={onChange}
          />

          {/*View json configuration*/}
          {!!value && <EntityJsonView data={value} isOpen={isJsonOpen} setIsOpen={setIsJsonOpen} />}
        </TabsContent>
        <TabsContent value={EditMode.JSON}>
          {/* Json editor */}
          <BaseForm.JsonEdit className="min-w-0 py-3" onSave={onChange} value={value} />
        </TabsContent>
        <TabsContent value={EditMode.WIZARD}>
          {/* Entity wizard */}
          <EntityWizardEdit
            isLoading={isLoading}
            isRootEntity={isRootEntity}
            node={node}
            onChange={onChange}
            onComplete={onSave}
            value={value}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
