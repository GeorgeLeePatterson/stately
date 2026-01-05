import type { AnyRecord } from '@statelyjs/schema/helpers';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';
import { useObjectCompare } from './use-object-compare';
import { useObjectSchema } from './use-object-schema';

// ----
// Various helper functions for objects
// ----

/**
 * Access merged values from object node's merged properties
 *
 * @typeParam S - The type of the schema.
 * @param merged
 * @param formData
 * @returns {Array<{schema: S['plugin']['AnyNode'], value: any}>}
 */
export const getMergedValues = <S extends Schemas = Schemas>(
  merged?: readonly S['plugin']['AnyNode'][] | null,
  formData?: any,
): Array<{ schema: S['plugin']['AnyNode']; value: any }> => {
  if (!merged || merged.length === 0) return [];
  return merged.map(schema => {
    const schemaKeys = new Set('keys' in schema && Array.isArray(schema.keys) ? schema.keys : []);
    const value = Object.fromEntries(Object.entries(formData).filter(([k]) => schemaKeys.has(k)));
    return { schema, value };
  });
};

/**
 * Access additional values from object node's additional properties
 *
 * @param propertyKeys
 * @param mergedKeys
 * @param additionalProperties
 * @param formData
 * @returns {AnyRecord}
 */
export const getAdditionalValues = <S extends Schemas = Schemas>(
  propertyKeys: Set<string>,
  mergedKeys: Set<string>,
  additionalProperties?: S['plugin']['AnyNode'] | null,
  formData?: any,
): AnyRecord => {
  if (!additionalProperties || !formData) return {};
  return Object.fromEntries(
    Object.entries(formData).filter(([k]) => !propertyKeys.has(k) && !mergedKeys.has(k)),
  );
};

/**
 * State for a merged field from `allOf` composition.
 */
export interface MergedField<S extends Schemas = Schemas> {
  /** The schema node for this merged section */
  schema: S['plugin']['AnyNode'];
  /** Current values for fields in this merged section */
  value: AnyRecord;
}

/**
 * Complete state and handlers for an object field editor.
 */
export interface ObjectFieldState<S extends Schemas = Schemas> {
  /** Current form data (may differ from original value if dirty) */
  formData: Record<string, any>;
  /** Handle a single field value change */
  handleFieldChange: (fieldName: string, newValue: any, isNullable: boolean) => void;
  /** Handle changes to merged fields (from allOf composition) */
  handleMergedFieldChange: (newMergedData: AnyRecord) => void;
  /** Handle changes to additional properties (dynamic keys) */
  handleAdditionalFieldChange: (newAdditionalData: AnyRecord) => void;
  /** Save the current form data */
  handleSave: () => void;
  /** Reset form data to original value */
  handleCancel: () => void;
  /** Sorted array of [fieldName, fieldSchema] tuples */
  fields: Array<[string, S['plugin']['AnyNode']]>;
  /** Merged schemas with their current values (from allOf) */
  mergedFields: Array<MergedField<S>>;
  /** Values for additional properties not in schema */
  additionalFieldsValue: AnyRecord;
  /** Whether form data differs from original value */
  isDirty: boolean;
  /** Whether current form data passes validation */
  isValid: boolean;
  /** Counter that increments on cancel - use as key to force child remount */
  resetKey: number;
}

/**
 * Manage state for editing an object-type schema field.
 *
 * Provides comprehensive state management for complex object editing including:
 * - Regular property fields
 * - Merged fields from `allOf` composition
 * - Additional properties (dynamic keys)
 * - Dirty tracking and validation
 *
 * @typeParam S - Your application's schema type
 *
 * @param options - Hook options
 * @param options.label - Optional label for validation error paths
 * @param options.node - The object schema node
 * @param options.value - Current value of the object
 * @param options.onSave - Callback when save is triggered
 *
 * @returns Complete state and handlers for the object editor
 *
 * @example
 * ```tsx
 * function ObjectEditor({ schema, value, onSave }) {
 *   const state = useObjectField({
 *     node: schema,
 *     value,
 *     onSave,
 *   });
 *
 *   return (
 *     <div>
 *       {state.fields.map(([name, fieldSchema]) => (
 *         <Field
 *           key={name}
 *           name={name}
 *           schema={fieldSchema}
 *           value={state.formData[name]}
 *           onChange={(v) => state.handleFieldChange(name, v, false)}
 *         />
 *       ))}
 *       <Button onClick={state.handleSave} disabled={!state.isDirty || !state.isValid}>
 *         Save
 *       </Button>
 *       <Button onClick={state.handleCancel} disabled={!state.isDirty}>
 *         Cancel
 *       </Button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useObjectField<S extends Schemas = Schemas>({
  label,
  node,
  value,
  onSave,
}: {
  label?: string | null;
  node: S['plugin']['Nodes']['object'];
  value: any;
  onSave: (formData: AnyRecord) => void;
}): ObjectFieldState {
  const { schema } = useStatelyUi<S, []>();
  const [formData, setFormData] = useState<Record<string, any>>(value ?? {});
  const [isDirty, setIsDirty] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const changes = useRef<Map<string, any>>(new Map());
  const hasChanged = useObjectCompare(value, formData, isDirty);

  const { fields, merged, additional, propertyKeys, mergedKeys } = useObjectSchema(node);

  // Zip merged schemas with their values (each schema gets its own subset of formData)
  const mergedFieldsValues = useMemo(() => {
    return getMergedValues(merged, formData);
  }, [merged, formData]);

  // Derive additional fields value (not in properties, not in merged)
  const additionalFieldsValue = useMemo(() => {
    return getAdditionalValues(propertyKeys, mergedKeys, additional, formData);
  }, [additional, formData, propertyKeys, mergedKeys]);

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

    // Reset map tracking changes
    changes.current = new Map();
  }, [formData, isValid, onSave]);

  const handleFieldChange = useCallback((fieldName: string, newValue: any, isNullable: boolean) => {
    // Update the map tracking changes
    changes.current.set(fieldName, newValue);

    if ((isNullable && newValue === null) || newValue === undefined) {
      setFormData(({ [fieldName]: _, ...d }) => d);
    } else {
      setFormData(d => ({ ...d, [fieldName]: newValue }));
    }
    setIsDirty(true);
  }, []);

  // Handle changes to merged fields (from allOf composition)
  const handleMergedFieldChange = useCallback(
    (newMergedData: AnyRecord) => {
      // Track changes
      for (const [k, v] of Object.entries(newMergedData)) {
        changes.current.set(k, v);
      }

      setFormData(d => {
        // Keep property keys and additional keys, replace merged keys
        const nonMergedData = Object.fromEntries(
          Object.entries(d).filter(([k]) => !mergedKeys.has(k)),
        );
        return { ...nonMergedData, ...newMergedData };
      });
      setIsDirty(true);
    },
    [mergedKeys],
  );

  // Handle changes to additionalProperties (dynamic user-added keys)
  const handleAdditionalFieldChange = useCallback(
    (newAdditionalData: AnyRecord) => {
      // Track changes
      for (const [k, v] of Object.entries(newAdditionalData)) {
        changes.current.set(k, v);
      }

      setFormData(d => {
        // Keep property keys and merged keys, replace additional keys
        const nonAdditionalData = Object.fromEntries(
          Object.entries(d).filter(([k]) => propertyKeys.has(k) || mergedKeys.has(k)),
        );
        return { ...nonAdditionalData, ...newAdditionalData };
      });
      setIsDirty(true);
    },
    [propertyKeys, mergedKeys],
  );

  const handleCancel = useCallback(() => {
    // Reset map tracking changes
    changes.current = new Map();

    setFormData(value ?? {});
    setIsDirty(false);
    setResetKey(k => k + 1);
  }, [value]);

  const changed = useMemo(() => hasChanged(changes.current), [hasChanged]);

  return {
    additionalFieldsValue,
    fields,
    formData,
    handleAdditionalFieldChange,
    handleCancel,
    handleFieldChange,
    handleMergedFieldChange,
    handleSave,
    isDirty: changed,
    isValid,
    mergedFields: mergedFieldsValues,
    resetKey,
  };
}
