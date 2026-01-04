import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Helper type to deal with 'maybe' `ApiError` types and extract error message. Especially helpful
 * with react-query errors.
 */
export function messageFromError(err: unknown): string | undefined {
  if (!err) return;
  let errMsg: string | undefined;
  if (typeof err === 'string') errMsg = err;
  if (err instanceof Error) errMsg = err.message;

  // Attempt to parse as `ApiError
  try {
    const parsed = errMsg ? JSON.parse(errMsg) : undefined;
    if (parsed && typeof parsed === 'object' && 'error' in parsed) {
      errMsg = parsed.error;
    }
  } catch {
    /* ignore */
  }

  return errMsg;
}

/**
 * Merge class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Pluralize a word
 */
export function pluralize(word: string) {
  // Words ending in s, x, z, ch, sh
  if (/(?:s|x|z|ch|sh)$/i.test(word)) return `${word}es`;

  // Words ending in consonant + y
  if (/[^aeiou]y$/i.test(word)) return `${word.slice(0, -1)}ies`;

  // Words ending in f or fe
  if (/f$/i.test(word)) return `${word.slice(0, -1)}ves`;
  if (/fe$/i.test(word)) return `${word.slice(0, -2)}ves`;

  // Words ending in consonant + o
  if (/[^aeiou]o$/i.test(word)) return `${word}es`;

  return `${word}s`;
}

/**
 * Compare two objects and return true if they are different.
 *
 * The implementation is quite manual but attempts to avoid recursion. It's a best effort object
 * compare.
 *
 * @param original
 * @param updated
 * @param changes
 * @param isDirty
 * @returns
 */
export function compareObjects(
  original: any,
  updated: any,
  changes?: Map<string, any>,
  isDirty?: boolean,
) {
  // Treat empty objects the same as undefined/null
  const isOriginalEmpty =
    !original || (typeof original === 'object' && Object.keys(original).length === 0);
  const isUpdatedEmpty =
    !updated || (typeof updated === 'object' && Object.keys(updated).length === 0);

  if (isOriginalEmpty && isUpdatedEmpty) return false;
  if ((isOriginalEmpty && !isUpdatedEmpty) || (!isOriginalEmpty && isUpdatedEmpty)) return true;

  const safeOriginal = original ?? {};
  const safeUpdated = updated ?? {};

  // Default to formData if no changes are being tracked
  const safeChanges = changes ?? new Map(Object.entries(safeUpdated));

  // Start false
  let isChanged = false;
  let visited = 1;
  const totalChanges = safeChanges.keys.length;

  for (const [name, val] of safeChanges) {
    visited += 1;

    // If neither are defined, skip
    if (!(name in safeUpdated) && !(name in safeOriginal)) continue;
    // if form data has been cleared
    if (!(name in safeUpdated) && name in safeOriginal) {
      isChanged = true;
      break;
    }
    // If form data has been set
    if (name in safeUpdated && !(name in safeOriginal)) {
      isChanged = true;
      break;
    }
    // If the types are different at all
    if (typeof safeUpdated[name] !== typeof safeOriginal[name]) {
      isChanged = true;
      break;
    }
    // If it's an object like value, rely on isDirty, sacrifices depth for simplicity
    if (
      [safeOriginal[name], safeUpdated[name]].some(v => Array.isArray(v) || typeof v === 'object')
    ) {
      if (safeOriginal[name] && !safeUpdated[name]) {
        isChanged = true;
        break;
      }
      if (!safeOriginal[name] && safeUpdated[name]) {
        isChanged = true;
        break;
      }
      if (Array.isArray(safeOriginal[name]) && Array.isArray(safeUpdated[name])) {
        if (safeOriginal[name].length !== safeUpdated[name].length) {
          isChanged = true;
          break;
        }
      }
      if (typeof safeOriginal[name] === 'object' && typeof safeUpdated[name] === 'object') {
        if (Object.keys(safeOriginal[name]).length !== Object.keys(safeUpdated[name]).length) {
          isChanged = true;
          break;
        }
      }
    }
    // Finally, check primitive values
    if (safeOriginal[name] !== val) {
      isChanged = true;
      break;
    }
  }

  if (!isChanged && visited === totalChanges) {
    isChanged = !!isDirty;
  }

  return isChanged;
}
