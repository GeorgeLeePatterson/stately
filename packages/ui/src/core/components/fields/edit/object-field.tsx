import { CoreNodeType } from '@stately/schema/core/nodes';
import { FormInput, WandSparkles } from 'lucide-react';
import { Fragment, useId } from 'react';
import { useStatelyUi } from '@/context';
import type { CoreObjectNode, CoreSchemas } from '@/core';
import type { AnyRecord } from '@/core/types';
import { DescriptionLabel } from '@/core/components/base/description';
import {
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from '@/core/components/ui/field';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs';
import { useObjectField } from '@/core/hooks/use-object-field';
import { GlowingSave } from '../../base/glowing-save';
import { FieldEdit } from '../field-edit';
import type { EditFieldProps } from '../types';
import { ObjectWizardEdit } from './object-wizard';

export enum ObjectEditMode {
  FORM = 'Form',
  WIZARD = 'Wizard',
}

export type ObjectEditProps<Schema extends CoreSchemas = CoreSchemas> = EditFieldProps<
  Schema,
  CoreObjectNode<Schema>,
  AnyRecord
>;

/**
 * Object field component - handles nested object structures
 * Uses explicit save pattern with dirty tracking
 */
export function ObjectEdit<Schema extends CoreSchemas = CoreSchemas>({
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
        <TabsTrigger value={ObjectEditMode.FORM} className="cursor-pointer text-xs">
          <FormInput className="h-3.5! w-3.5!" />
          Form
        </TabsTrigger>
        <TabsTrigger value={ObjectEditMode.WIZARD} className="cursor-pointer text-xs">
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
          value={value}
          onChange={onChange}
        />
      </TabsContent>

      {/* Wizard mode */}
      <TabsContent value={ObjectEditMode.WIZARD}>
        <ObjectWizardEdit
          formId={objectFormId}
          label={label}
          node={node}
          value={value}
          onChange={onChange}
          isEmbedded
        />
      </TabsContent>
    </Tabs>
  ) : (
    <ObjectForm formId={objectFormId} label={label} node={node} value={value} onChange={onChange} />
  );
}

type ObjectFormProps<Schema extends CoreSchemas = CoreSchemas> = EditFieldProps<
  Schema,
  CoreObjectNode<Schema>,
  AnyRecord
>;

function ObjectForm<Schema extends CoreSchemas = CoreSchemas>({
  formId,
  label,
  node,
  value,
  onChange,
  isWizard,
}: ObjectFormProps<Schema>) {
  const { schema } = useStatelyUi();
  const { formData, handleFieldChange, handleSave, handleCancel, fields, isDirty, isValid } =
    useObjectField({ label, node, value, onSave: onChange });

  return (
    <div className="flex-1 border-l-4 border-border rounded-xs pl-4 py-3 space-y-3">
      <FieldGroup className="space-y-4 pl-2">
        <FieldSet className="min-w-0">
          {fields.map(([propName, propNode], index, arr) => {
            const isRequired = node.required.includes(propName);
            const propLabel = schema.utils.generateFieldLabel(propName);
            const propDescription = propNode.description;
            const propValue = formData?.[propName];

            // If the value is not set, then wrap in nullable
            let propSchema = propNode;
            const isNullable = propNode.nodeType === CoreNodeType.Nullable;
            const wrapNullable = !isRequired && !isNullable;
            if (wrapNullable) {
              propSchema = { nodeType: CoreNodeType.Nullable, innerSchema: propNode };
            }

            const isWrappedNullable = propSchema.nodeType === CoreNodeType.Nullable;
            const fieldFormId = `field-${propLabel || 'label'}-${formId}`;

            return (
              <Fragment key={propName}>
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
                <FieldEdit
                  formId={fieldFormId}
                  node={propSchema}
                  value={propValue}
                  onChange={handleFieldChange.bind(null, propName, isWrappedNullable)}
                  label={propLabel}
                  isRequired={isRequired}
                  isWizard={isWizard}
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
          mode="edit"
          size="sm"
          label={label ? `${label} Object` : 'Object'}
          isDisabled={!isValid}
          disabledExplain="Fill in all required fields."
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
