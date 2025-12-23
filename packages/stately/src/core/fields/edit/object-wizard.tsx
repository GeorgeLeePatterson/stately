import type { AnyRecord } from '@statelyjs/schema/helpers';
import { cn } from '@statelyjs/ui';
import { Button } from '@statelyjs/ui/components/base/button';
import { Field, FieldGroup, FieldLegend, FieldSet } from '@statelyjs/ui/components/base/field';
import { Progress } from '@statelyjs/ui/components/base/progress';
import { Skeleton } from '@statelyjs/ui/components/base/skeleton';
import { BaseForm } from '@statelyjs/ui/form';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useObjectField } from '@/core/hooks/use-object-field';
import type { Schemas } from '@/core/schema';
import { CoreNodeType } from '@/core/schema/nodes';
import { EntityProperty } from '@/core/views/entity/entity-properties';
import { useStatelyUi } from '@/index';
import type { ObjectEditNode, ObjectEditProps } from './object-field';

export interface ObjectWizardBaseProps {
  onComplete?: () => void;
  isLoading?: boolean;
  isEmbedded?: boolean;
}

export type ObjectWizardEditProps<
  Schema extends Schemas = Schemas,
  Node extends ObjectEditNode<Schema> = ObjectEditNode<Schema>,
  V = AnyRecord,
> = ObjectWizardBaseProps & ObjectEditProps<Schema, Node, V>;

export const ObjectWizardEdit = <
  Schema extends Schemas = Schemas,
  Node extends ObjectEditNode<Schema> = ObjectEditNode<Schema>,
  V = AnyRecord,
>({
  formId,
  label,
  node,
  value,
  onChange,
  onComplete,
  isLoading,
  isEmbedded,
}: ObjectWizardEditProps<Schema, Node, V>) => {
  const { schema, utils } = useStatelyUi<Schema>();

  const onSave = useCallback(
    (data: any) => {
      onChange(data);
      onComplete?.();
    },
    [onChange, onComplete],
  );

  const {
    extraFieldsValue,
    formData,
    handleAdditionalFieldChange,
    handleFieldChange,
    handleMergedFieldChange,
    handleSave,
    handleCancel: _,
    fields,
    isValid,
    mergedFields,
  } = useObjectField<Schema>({ label, node, onSave, value });

  const requiredFields = new Set(node.required || []);

  // Calculate step ranges:
  // - Merged fields first (from allOf composition)
  // - Then regular property fields
  // - Finally additionalProperties if present
  const hasAdditionalProperties = !!node.additionalProperties;
  const totalSteps = mergedFields.length + fields.length + (hasAdditionalProperties ? 1 : 0);

  const [currentStep, setCurrentStep] = useState(0);

  // Determine which section we're in based on step index
  const isMergedStep = currentStep < mergedFields.length;
  const isPropertyStep =
    currentStep >= mergedFields.length && currentStep < mergedFields.length + fields.length;
  const isAdditionalPropertiesStep =
    hasAdditionalProperties && currentStep === mergedFields.length + fields.length;

  // Get current merged field if on a merged step
  const currentMergedField = isMergedStep ? mergedFields[currentStep] : null;

  // Get current property field if on a property step
  const propertyIndex = currentStep - mergedFields.length;
  const currentField = isPropertyStep ? fields[propertyIndex] : null;

  const [fieldName, propNode] = currentField ?? ['', null];
  const isRequired = requiredFields.has(fieldName);
  const fieldLabel = utils?.generateFieldLabel?.(fieldName) ?? fieldName;
  const fieldValue = formData?.[fieldName];

  const isNullableNode = propNode?.nodeType === CoreNodeType.Nullable;
  const isNullable = !isRequired || isNullableNode;

  // Memoize the synthetic map node for additionalProperties
  const additionalPropertiesMapNode = useMemo(() => {
    if (!node.additionalProperties) return null;
    return { nodeType: CoreNodeType.Map, valueSchema: node.additionalProperties };
  }, [node.additionalProperties]);

  // Check if current field/step is valid
  const isCurrentFieldValid = useMemo(() => {
    // Additional properties step is always valid (optional by nature)
    if (isAdditionalPropertiesStep) return true;

    // Merged field step - validate the merged schema
    if (isMergedStep && currentMergedField) {
      const fieldValidationResult = schema.validate({
        data: currentMergedField.value,
        path: `${label ?? ''}[ObjectNode][merged]`,
        schema: currentMergedField.schema,
      });
      return fieldValidationResult.valid;
    }

    // Property field step
    if (!propNode) return false;

    if (isNullable) return true;

    const fieldValidationResult = schema.validate({
      data: fieldValue,
      path: `${label ?? ''}[ObjectNode][property]`,
      schema: propNode,
    });
    return fieldValidationResult.valid;
  }, [
    isAdditionalPropertiesStep,
    isMergedStep,
    currentMergedField,
    propNode,
    isNullable,
    schema,
    fieldValue,
    label,
  ]);

  // For regular property field steps, we need a current field
  // Merged steps and additional properties steps are handled separately
  if (isPropertyStep && !currentField) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (isLastStep) {
      handleSave();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  return (
    <div
      className={cn('space-y-6', isEmbedded ? 'pl-2 border-l-2 border-primary/40 rounded-xs' : '')}
    >
      {/* Progress Bar */}
      {fields.length > 1 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Step {currentStep + 1} of {fields.length}
            </span>
            <span className="text-muted-foreground">{Math.round(progress)}% complete</span>
          </div>
          <Progress className="h-2" value={progress} />
        </div>
      )}

      {/* Current Field */}
      <FieldGroup className="min-h-48 flex flex-col justify-center">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : isMergedStep && currentMergedField ? (
          // Merged field step (from allOf composition)
          <FieldSet className="min-w-0">
            <BaseForm.FieldEdit<Schema>
              formId={`${formId}-merged-${currentStep}`}
              isRequired
              isWizard
              node={currentMergedField.schema}
              onChange={v => handleMergedFieldChange(v as AnyRecord)}
              value={currentMergedField.value}
            />
          </FieldSet>
        ) : isAdditionalPropertiesStep && additionalPropertiesMapNode ? (
          <FieldSet className="min-w-0">
            <FieldLegend variant="label">Additional Properties</FieldLegend>
            <BaseForm.FieldEdit<Schema>
              formId={`${formId}-additional`}
              isWizard
              node={additionalPropertiesMapNode}
              onChange={v => handleAdditionalFieldChange(v as AnyRecord)}
              value={extraFieldsValue}
            />
          </FieldSet>
        ) : propNode ? (
          <EntityProperty fieldName={fieldName} isRequired={isRequired} node={propNode}>
            {/* Primitive field view */}
            {schema.plugins?.core.isPrimitiveNodeLike(propNode) ? (
              <Field>
                <BaseForm.FieldEdit<Schema>
                  formId={formId}
                  isRequired={isRequired}
                  label={fieldLabel}
                  node={propNode}
                  onChange={handleFieldChange.bind(null, fieldName, isNullable)}
                  value={fieldValue}
                />
              </Field>
            ) : (
              // Complex field view
              <BaseForm.FieldEdit<Schema>
                formId={formId}
                isRequired={isRequired}
                isWizard
                label={fieldLabel}
                node={propNode}
                onChange={handleFieldChange.bind(null, fieldName, isNullable)}
                value={fieldValue}
              />
            )}
          </EntityProperty>
        ) : null}
      </FieldGroup>

      {/* Navigation */}
      <div className="flex justify-between items-center py-4 border-t">
        <Button
          className="cursor-pointer"
          disabled={isFirstStep || isLoading}
          onClick={handlePrevious}
          type="button"
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          {Array.from({ length: totalSteps }, (_, index) => (
            <span
              className={`inline-block w-2 h-2 rounded-full mx-1 ${
                index === currentStep
                  ? 'bg-primary'
                  : index < currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted'
              }`}
              // biome-ignore lint/suspicious/noArrayIndexKey: ''
              key={`wizard-step-${index}`}
            />
          ))}
        </div>

        {/* Next button */}
        <Button
          className="cursor-pointer"
          disabled={!isCurrentFieldValid || isLoading || (isLastStep && !isValid)}
          onClick={handleNext}
          type="button"
        >
          {isLastStep ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Complete
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
