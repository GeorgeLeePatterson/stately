import type { StatelyConfig, StatelySchemas } from '@stately/schema';
import type { AnyRecord } from '@stately/schema/helpers';
import { FileJson, FormInput, WandSparkles } from 'lucide-react';
import { useState } from 'react';
import { FieldGroup } from '@/components/ui/field';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JsonEdit } from '../../fields/json-edit';
import { JsonView } from '../../fields/json-view';
import { EntityEditForm } from './entity-form-view';
import { EntityWizardView } from './entity-wizard-view';

export enum EditMode {
  FORM = 'Form',
  JSON = 'JSON',
  WIZARD = 'Wizard',
}

interface EntityEditViewProps<Config extends StatelyConfig = StatelyConfig> {
  schema: StatelySchemas<Config>['ObjectNode'];
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
export function EntityEditView<Config extends StatelyConfig = StatelyConfig>({
  schema,
  value,
  defaultMode,
  onChange,
  onSave,
  isRootEntity,
  isLoading,
}: EntityEditViewProps<Config>) {
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
          <EntityEditForm
            schema={schema}
            value={value}
            onChange={onChange}
            isRootEntity={isRootEntity}
            isLoading={isLoading}
          />
          {/*View json configuration*/}
          {!!value && Object.keys(value).length > 0 && (
            <JsonView data={value} isOpen={debugOpen} setIsOpen={setDebugOpen} />
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
          schema={schema}
          value={value}
          onChange={onChange}
          onComplete={onSave}
          isLoading={isLoading}
        />
      </TabsContent>
    </Tabs>
  );
}
