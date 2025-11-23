import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const NAMESPACE = 'stately/ui';

/**
 * Merge class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const isDev = process.env.NODE_ENV === 'development';

const logger = (...args: any[]) => {
  const namespace = `[${NAMESPACE}]`;
  const namespacedArgs =
    args?.length > 2 && typeof args[0] === 'string' && typeof args[1] === 'string'
      ? [`${namespace} (${args[0]})`, ...args.slice(1)]
      : [namespace, ...args];
  return namespacedArgs;
};

export const devLog = {
  debug: (...args: any[]) => {
    if (isDev) console.debug(...logger(...args));
  },

  error: (...args: any[]) => {
    if (isDev) console.error(...logger(...args));
  },

  log: (...args: any[]) => {
    if (isDev) console.log(...logger(...args));
  },

  warn: (...args: any[]) => {
    if (isDev) console.warn(...logger(...args));
  },
};
