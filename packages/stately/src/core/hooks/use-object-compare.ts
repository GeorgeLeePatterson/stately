import { compareObjects } from '@statelyjs/ui/lib/utils';
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
      // This identifies a flush of values up the chain
      if (changes && changes.size === 0 && !isDirty) return false;
      return compareObjects(value, formData, changes, isDirty);
    },
    [value, formData, isDirty],
  );
}
