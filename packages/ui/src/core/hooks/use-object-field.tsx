import type { AnyRecord } from '@stately/schema/helpers';
import { useCallback, useEffect, useState } from 'react';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';

export interface ObjectFieldState<S extends Schemas = Schemas> {
  formData: Record<string, any>;
  handleFieldChange: (fieldName: string, isNullable: boolean, newValue: any) => void;
  handleSave: () => void;
  handleCancel: () => void;
  fields: Array<[string, S['plugin']['AnyNode']]>;
  isDirty: boolean;
  isValid: boolean;
}

export function useObjectField<S extends Schemas = Schemas>({
  label,
  node,
  value,
  onSave,
}: {
  label?: string;
  node: any;
  value: any;
  onSave: (formData: AnyRecord) => void;
}): ObjectFieldState {
  const { schema } = useStatelyUi<S, []>();
  const [formData, setFormData] = useState<Record<string, any>>(value ?? {});
  const [isDirty, setIsDirty] = useState(false);

  const required = new Set<string>(node?.required || []);
  const mergedFields = (node as any).merged
    ? [['Additional', (node as any).merged] as [string, any]]
    : [];
  const baseValueFields = Object.entries(node.properties).filter(
    ([fieldName]) => fieldName !== 'id',
  );
  const valueFields = [...baseValueFields, ...mergedFields];
  const fields = schema.plugins.core.sortEntityProperties<S['plugin']['AnyNode']>(
    valueFields,
    value,
    required,
  );

  const objectValidation = schema.validate({
    data: formData,
    path: `${label ?? ''}[ObjectNode]`,
    schema: node,
  });
  const isValid = objectValidation.valid;

  // Update formData when value changes (e.g., when API data loads)
  useEffect(() => {
    if (value && !isDirty) {
      setFormData(value);
    }
  }, [value, isDirty]);

  // Handle save - notify parent with current formData
  const handleSave = useCallback(() => {
    if (!isValid) return;
    onSave(formData);
    setIsDirty(false);
  }, [formData, isValid, onSave]);

  const handleFieldChange = useCallback((fieldName: string, isNullable: boolean, newValue: any) => {
    if ((isNullable && newValue === null) || newValue === undefined) {
      setFormData(({ [fieldName]: _, ...d }) => d);
    } else {
      setFormData(d => ({ ...d, [fieldName]: newValue }));
    }
    setIsDirty(true);
  }, []);

  const handleCancel = useCallback(() => {
    setFormData(value ?? {});
    setIsDirty(false);
  }, [value]);

  return {
    fields,
    formData,
    handleCancel,
    handleFieldChange,
    handleSave,
    isDirty,
    isValid,
  } as ObjectFieldState;
}
