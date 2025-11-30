import type { AnyRecord } from '@stately/schema/helpers';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Fragment, useCallback, useState } from 'react';
import { FieldEdit } from '@/base/form/field-edit';
import { cn } from '@/base/lib/utils';
import { Button } from '@/base/ui/button';
import { Field, FieldGroup } from '@/base/ui/field';
import { Progress } from '@/base/ui/progress';
import { Skeleton } from '@/base/ui/skeleton';
import { useObjectField } from '@/core/hooks/use-object-field';
import type { Schemas } from '@/core/schema';
import { CoreNodeType } from '@/core/schema/nodes';
import { EntityPropertyView } from '@/core/views/entity/entity-property-view';
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
    formData,
    handleFieldChange,
    handleSave,
    handleCancel: _,
    fields,
    isValid,
  } = useObjectField<Schema>({ label, node, onSave, value });

  const requiredFields = new Set(node.required || []);

  const [currentStep, setCurrentStep] = useState(0);

  const currentField = fields[currentStep];
  if (!currentField) return null;

  const [fieldName, propNode] = currentField;
  const isRequired = requiredFields.has(fieldName);
  const fieldLabel = utils?.generateFieldLabel?.(fieldName) ?? fieldName;
  const fieldValue = formData?.[fieldName];

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === fields.length - 1;
  const progress = ((currentStep + 1) / fields.length) * 100;

  const isNullableNode = propNode.nodeType === CoreNodeType.Nullable;
  const isNullable = !isRequired || isNullableNode;

  // Check if current field is valid (for required fields)
  const fieldValidationResult = schema.validate({
    data: fieldValue,
    path: `${label ?? ''}[ObjectNode][property]`,
    schema: propNode,
  });
  const isCurrentFieldValid = isNullable || fieldValidationResult.valid;

  const handleNext = () => {
    if (isLastStep) {
      handleSave();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, fields.length - 1));
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
        ) : (
          <Fragment>
            <EntityPropertyView fieldName={fieldName} isRequired={isRequired} node={propNode}>
              {/* Primitive field view */}
              {schema.plugins?.core.isPrimitiveNode(propNode) ? (
                <Field>
                  <FieldEdit<Schema>
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
                <FieldEdit<Schema>
                  formId={formId}
                  isRequired={isRequired}
                  isWizard
                  label={fieldLabel}
                  node={propNode}
                  onChange={handleFieldChange.bind(null, fieldName, isNullable)}
                  value={fieldValue}
                />
              )}
            </EntityPropertyView>
          </Fragment>
        )}
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
          {fields.map((name, index) => (
            <span
              className={`inline-block w-2 h-2 rounded-full mx-1 ${
                index === currentStep
                  ? 'bg-primary'
                  : index < currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted'
              }`}
              key={`wizard-field-${name}`}
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
