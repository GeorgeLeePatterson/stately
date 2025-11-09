import { NodeType, type StatelyConfig } from '@stately/schema';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Fragment, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup } from '@/components/ui/field';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EntityPropertyView } from '@/components/views/entity/entity-property-view';
import { useStatelyUi } from '@/context';
import { useObjectField } from '@/hooks/use-object-field';
import { cn } from '@/lib/utils';
import { FieldEdit } from '../field-edit';
import type { ObjectEditProps } from './object-field';

export interface ObjectWizardBaseProps {
  onComplete?: () => void;
  isLoading?: boolean;
  isEmbedded?: boolean;
}

export type ObjectWizardEditProps<Config extends StatelyConfig = StatelyConfig> =
  ObjectWizardBaseProps & ObjectEditProps<Config>;

export const ObjectWizardEdit = <Config extends StatelyConfig = StatelyConfig>({
  formId,
  label,
  node,
  value,
  onChange,
  onComplete,
  isLoading,
  isEmbedded,
}: ObjectWizardEditProps<Config>) => {
  const { integration } = useStatelyUi();
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
  } = useObjectField({ label, node, value, onSave });

  const requiredFields = new Set(node.required || []);

  const [currentStep, setCurrentStep] = useState(0);

  const currentField = fields[currentStep];
  if (!currentField) return null;

  const [fieldName, propNode] = currentField;
  const isRequired = requiredFields.has(fieldName);
  const fieldLabel = integration.helpers.generateFieldLabel(fieldName);
  const fieldValue = formData?.[fieldName];

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === fields.length - 1;
  const progress = ((currentStep + 1) / fields.length) * 100;

  const isNullableNode = propNode.nodeType === NodeType.Nullable;
  const isNullable = !isRequired || isNullableNode;

  // Check if current field is valid (for required fields)
  const fieldValidationResult = integration.validate.field(
    `${label ? label : ''}[ObjectNode][property]`,
    fieldLabel,
    fieldValue,
    propNode,
    isRequired,
  );
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
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Current Field */}
      <FieldGroup className="min-h-48 flex flex-col justify-center">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <Fragment>
            <EntityPropertyView fieldName={fieldName} node={propNode} isRequired={isRequired}>
              {/* Primitive field view */}
              {integration.helpers.isPrimitive(propNode) ? (
                <Field>
                  <FieldEdit
                    formId={formId}
                    node={propNode}
                    value={fieldValue}
                    onChange={handleFieldChange.bind(null, fieldName, isNullable)}
                    label={fieldLabel}
                    isRequired={isRequired}
                  />
                </Field>
              ) : (
                // Complex field view
                <FieldEdit
                  formId={formId}
                  node={propNode}
                  value={fieldValue}
                  onChange={handleFieldChange.bind(null, fieldName, isNullable)}
                  label={fieldLabel}
                  isRequired={isRequired}
                  isWizard
                />
              )}
            </EntityPropertyView>
          </Fragment>
        )}
      </FieldGroup>

      {/* Navigation */}
      <div className="flex justify-between items-center py-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep || isLoading}
          className="cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          {fields.map((name, index) => (
            <span
              key={`wizard-field-${name}`}
              className={`inline-block w-2 h-2 rounded-full mx-1 ${
                index === currentStep
                  ? 'bg-primary'
                  : index < currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Next button */}
        <Button
          type="button"
          onClick={handleNext}
          disabled={!isCurrentFieldValid || isLoading || (isLastStep && !isValid)}
          className="cursor-pointer"
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
