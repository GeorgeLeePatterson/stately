import { FieldContent, FieldDescription, FieldLabel } from '@statelyjs/ui/components/base/field';
import { DescriptionLabel } from '@statelyjs/ui/components/description-label';

export interface PropertyLabelProps {
  label?: React.ReactNode;
  description?: string | null;
  fieldLabelProps?: React.ComponentProps<typeof FieldLabel>;
  isRequired?: boolean;
}

export function PropertyLabel({
  label,
  description,
  fieldLabelProps,
  isRequired,
}: PropertyLabelProps) {
  return (
    <FieldContent>
      {label && (
        <FieldLabel {...fieldLabelProps}>
          <span>
            {label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </span>
        </FieldLabel>
      )}
      {description && (
        <FieldDescription>
          <DescriptionLabel>{description}</DescriptionLabel>
        </FieldDescription>
      )}
    </FieldContent>
  );
}
