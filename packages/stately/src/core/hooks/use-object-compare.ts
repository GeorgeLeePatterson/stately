import { useCallback } from 'react';

/**
 * A simple hook providing a method to validate whether incomning value, when compared to runtime
 * form data, has changed.
 *
 * Sometimes just a flag tracking form changes is not enough, ie when a value changes *back*. This
 * hook provides a function for determining whether the value has in fact changed.
 *
 * Typically, a `React.RefObject` is used to track `changes`, the argument to the method returned.
 *
 * @param value - Any object like value representing the incoming value
 * @param formData - Any object like value representing the form data
 * @param isDirty - A boolean indicating whether the form data has been modified
 * @returns A function that returns a boolean indicating whether the value has changed
 */
export function useObjectCompare(value: any, formData: any, isDirty: boolean) {
  return useCallback(
    (changes?: Map<string, any>) => {
      // Treat empty objects the same as undefined/null
      const isValueEmpty = !value || (typeof value === 'object' && Object.keys(value).length === 0);
      const isFormDataEmpty =
        !formData || (typeof formData === 'object' && Object.keys(formData).length === 0);

      if (isValueEmpty && isFormDataEmpty) return false;
      if ((isValueEmpty && !isFormDataEmpty) || (!isValueEmpty && isFormDataEmpty)) return true;

      const safeValue = value ?? {};
      const safeFormData = formData ?? {};

      // Default to formData if no changes are being tracked
      const safeChanges = changes ?? new Map(Object.entries(safeFormData));

      // Start false
      let isChanged = false;
      for (const [name, val] of safeChanges) {
        // If neither are defined, skip
        if (!(name in safeFormData) && !(name in safeValue)) continue;
        // if form data has been cleared
        if (!(name in safeFormData) && name in safeValue) {
          isChanged = true;
          break;
        }
        // If form data has been set
        if (name in safeFormData && !(name in safeValue)) {
          isChanged = true;
          break;
        }
        // If the types are different at all
        if (typeof safeFormData[name] !== typeof safeValue[name]) {
          isChanged = true;
          break;
        }
        // If it's an object like value, rely on isDirty, sacrifices depth for simplicity
        if (
          [safeValue[name], safeFormData[name]].some(v => Array.isArray(v) || typeof v === 'object')
        ) {
          isChanged = isDirty;
        }
        // Finally, check primitive values
        if (safeValue[name] !== val) {
          isChanged = true;
          break;
        }
      }

      return isChanged;
    },
    [value, formData, isDirty],
  );
}
