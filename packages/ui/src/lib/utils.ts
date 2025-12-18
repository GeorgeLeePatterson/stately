import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Helpful with react-query errors
 */
export function messageFromError(err: unknown): string | undefined {
  if (!err) return;
  return parseApiError(err);
}

/**
 * Helper type to deal with 'maybe' `ApiError` types and extract error message.
 */
export function parseApiError(err: unknown): string | undefined {
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
