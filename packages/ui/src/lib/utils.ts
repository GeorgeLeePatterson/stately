import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { toKebabCase, toSpaceCase, toTitleCase } from '@stately/schema/helpers';
export { toKebabCase, toSpaceCase, toTitleCase };
