import type { AnyRecord } from '@statelyjs/schema/helpers';
import { generateFieldFormId } from '@statelyjs/ui';
import { DescriptionLabel, GlowingSave } from '@statelyjs/ui/components';
import {
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@statelyjs/ui/components/base/field';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@statelyjs/ui/components/base/tabs';
import { BaseForm, type FieldEditProps } from '@statelyjs/ui/form';
import { FormInput, WandSparkles } from 'lucide-react';
import { Fragment, useId } from 'react';
import { useObjectField } from '@/core/hooks/use-object-field';
import type { Schemas } from '@/core/schema';
import { CoreNodeType } from '@/core/schema/nodes';
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
      <TabsContent className="border-t border-border" value={ObjectEditMode.FORM}>
        <ObjectForm
          formId={objectFormId}
          label={label}
          node={node}
          onChange={onChange}
          value={value}
        />
      </TabsContent>

      {/* Wizard mode */}
      <TabsContent className="border-t border-border" value={ObjectEditMode.WIZARD}>
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

  const {
    extraFieldsValue,
    fields,
    formData,
    handleFieldChange,
    handleMergedFieldChange,
    handleAdditionalFieldChange,
    handleCancel,
    handleSave,
    isDirty,
    isValid,
    mergedFields,
    resetKey,
  } = useObjectField<Schema>({ label, node, onSave: onChange, value });

  return (
    <div className="flex-1 border-l-4 border-border rounded-xs pl-4 py-3 space-y-3">
      <FieldGroup className="space-y-4 pl-2">
        <FieldSet className="min-w-0">
          {/* Render merged schemas from allOf composition */}
          {mergedFields.length > 0 && (
            <>
              {mergedFields.map(({ schema, value }, index) => (
                <Fragment key={`merged-${schema.nodeType}-${index}-${resetKey}`}>
                  <BaseForm.FieldEdit<Schema>
                    formId={generateFieldFormId(schema.nodeType, `merged-${index}`, formId)}
                    isRequired
                    isWizard={isWizard}
                    node={schema}
                    onChange={v => handleMergedFieldChange(v as AnyRecord)}
                    value={value}
                  />
                  <FieldSeparator />
                </Fragment>
              ))}
            </>
          )}

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
            const fieldFormId = generateFieldFormId(
              propSchema.nodeType,
              propLabel || 'object field',
              formId,
            );

            return (
              <Fragment key={`${propName}-${resetKey}`}>
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
                <BaseForm.FieldEdit<Schema>
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

        {/* Render additionalProperties for dynamic keys */}
        {node.additionalProperties && (
          <>
            <FieldSeparator />
            <FieldSet className="min-w-0">
              <FieldLegend variant="label">Additional Properties</FieldLegend>
              <BaseForm.FieldEdit<Schema>
                formId={generateFieldFormId(CoreNodeType.Map, 'additional-properties', formId)}
                isWizard={isWizard}
                key={`additional-properties-${resetKey}`}
                node={{ nodeType: CoreNodeType.Map, valueSchema: node.additionalProperties }}
                onChange={v => handleAdditionalFieldChange(v as AnyRecord)}
                value={extraFieldsValue}
              />
            </FieldSet>
          </>
        )}
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
