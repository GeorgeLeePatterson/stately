import type { Schemas } from '@stately/schema';
import { CoreNodeType } from '@stately/schema/core/nodes';
import type { AnyRecord } from '@stately/schema/helpers';
import { FormInput, WandSparkles } from 'lucide-react';
import { Fragment, useId } from 'react';
import { DescriptionLabel } from '@/base/components/description-label';
import { GlowingSave } from '@/base/components/glowing-save';
import type { FieldEditProps } from '@/base/form/field-edit';
import { FieldEdit } from '@/base/form/field-edit';
import {
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from '@/base/ui/field';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/base/ui/tabs';
import { useObjectField } from '@/core/hooks/use-object-field';
import { useStatelyUi } from '@/index';
import { ObjectWizardEdit } from './object-wizard';

export enum ObjectEditMode {
  FORM = 'Form',
  WIZARD = 'Wizard',
}

export type ObjectEditNode<Schema extends Schemas = Schemas> = Schema['plugin']['Nodes']['object'];

export type ObjectEditProps<
  Schema extends Schemas = Schemas,
  Node extends ObjectEditNode<Schema> = ObjectEditNode<Schema>,
  V = AnyRecord,
> = FieldEditProps<Schema, Node, V>;

/**
 * Object field component - handles nested object structures
 * Uses explicit save pattern with dirty tracking
 */
export function ObjectEdit<Schema extends Schemas = Schemas>({
  formId,
  label,
  node,
  value,
  onChange,
}: ObjectEditProps<Schema>) {
  const instanceFormId = useId();
  const objectFormId = `object-${instanceFormId}-${formId}`;

  return Object.keys(node.properties).filter(k => k !== 'id').length > 1 ? (
    <Tabs defaultValue={ObjectEditMode.FORM}>
      {/* Mode Toggle */}
      <TabsList>
        <TabsTrigger className="cursor-pointer text-xs" value={ObjectEditMode.FORM}>
          <FormInput className="h-3.5! w-3.5!" />
          Form
        </TabsTrigger>
        <TabsTrigger className="cursor-pointer text-xs" value={ObjectEditMode.WIZARD}>
          <WandSparkles className="h-3.5! w-3.5!" />
          Wizard
        </TabsTrigger>
      </TabsList>

      {/* Form mode */}
      <TabsContent value={ObjectEditMode.FORM}>
        <ObjectForm
          formId={objectFormId}
          label={label}
          node={node}
          onChange={onChange}
          value={value}
        />
      </TabsContent>

      {/* Wizard mode */}
      <TabsContent value={ObjectEditMode.WIZARD}>
        <ObjectWizardEdit
          formId={objectFormId}
          isEmbedded
          label={label}
          node={node}
          onChange={onChange}
          value={value}
        />
      </TabsContent>
    </Tabs>
  ) : (
    <ObjectForm formId={objectFormId} label={label} node={node} onChange={onChange} value={value} />
  );
}

type ObjectFormProps<Schema extends Schemas = Schemas> = FieldEditProps<
  Schema,
  Schema['plugin']['Nodes']['object'],
  AnyRecord
>;

function ObjectForm<Schema extends Schemas = Schemas>({
  formId,
  label,
  node,
  value,
  onChange,
  isWizard,
}: ObjectFormProps<Schema>) {
  const { utils } = useStatelyUi<Schema>();

  const { formData, handleFieldChange, handleSave, handleCancel, fields, isDirty, isValid } =
    useObjectField<Schema>({ label, node, onSave: onChange, value });

  return (
    <div className="flex-1 border-l-4 border-border rounded-xs pl-4 py-3 space-y-3">
      <FieldGroup className="space-y-4 pl-2">
        <FieldSet className="min-w-0">
          {fields.map(([propName, propNode], index, arr) => {
            const isRequired = node.required.includes(propName);
            const propLabel = utils?.generateFieldLabel(propName) || '';
            const propDescription = propNode.description;
            const propValue = formData?.[propName];

            // If the value is not set, then wrap in nullable
            let propSchema: Schema['plugin']['AnyNode'] = propNode;
            const isNullable = propNode.nodeType === CoreNodeType.Nullable;
            const wrapNullable = !isRequired && !isNullable;
            if (wrapNullable) {
              propSchema = {
                innerSchema: propNode,
                nodeType: CoreNodeType.Nullable,
              } as Schema['plugin']['AnyNode'];
            }

            const isWrappedNullable = propSchema.nodeType === CoreNodeType.Nullable;
            const fieldFormId = `field-${propLabel || 'label'}-${formId}`;

            return (
              <Fragment key={propName}>
                {/* Nullable takes care of its own label */}
                {(propLabel || propDescription) && !isWrappedNullable && (
                  <FieldContent>
                    {propLabel && (
                      <FieldLabel htmlFor={fieldFormId}>
                        {propLabel}
                        {isRequired && <span className="text-destructive ml-1">*</span>}
                      </FieldLabel>
                    )}
                    {propDescription && (
                      <FieldDescription>
                        <DescriptionLabel>{propDescription}</DescriptionLabel>
                      </FieldDescription>
                    )}
                  </FieldContent>
                )}

                {/* Property field */}
                <FieldEdit<Schema>
                  formId={fieldFormId}
                  isRequired={isRequired}
                  isWizard={isWizard}
                  label={propLabel}
                  node={propSchema}
                  onChange={handleFieldChange.bind(null, propName, isWrappedNullable)}
                  value={propValue}
                />
                {index !== arr.length - 1 && <FieldSeparator />}
              </Fragment>
            );
          })}
        </FieldSet>

        {/*
          Render merged union if present - properties are spread into this object

          TODO: Remove
            This is WRONG. The properties need to be collected from the associated enums.
            Then the formData needs to be filtered to only include those properties.
        */}
        {/*{node.merged && (
          <FieldEdit
            formId={`merged-${formId}`}
            node={node.merged}
            value={formData}
            onChange={newValue => {
              // Merged union updates are spread into the object
              setFormData({ ...(value ?? {}), ...newValue });
              setIsDirty(true);
            }}
            label="Configuration"
          />
        )}*/}
      </FieldGroup>

      {/* Save/Cancel buttons appear when dirty */}
      {isDirty && (
        <GlowingSave
          disabledExplain="Fill in all required fields."
          isDisabled={!isValid}
          label={label ? `'${label}' Object` : 'Object'}
          mode="edit"
          onCancel={handleCancel}
          onSave={handleSave}
          size="sm"
        />
      )}
    </div>
  );
}
