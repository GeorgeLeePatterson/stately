export const NAMESPACE = '@statelyjs/ui';

const isDev = process.env.NODE_ENV === 'development';

const logger = (ns: string, ...args: any[]) => {
  const namespace = `[${ns}]`;
  const namespacedArgs =
    args?.length > 2 && typeof args[0] === 'string' && typeof args[1] === 'string'
      ? [`${namespace} (${args[0]})`, ...args.slice(1)]
      : [namespace, ...args];
  return namespacedArgs;
};

/**
 * Simple logger, helps ensure more consistent logging
 */
export const devLogger = (namespace: string = NAMESPACE) => ({
  debug: (...args: any[]) => {
    if (isDev) console.debug(...logger(namespace, ...args));
  },

  error: (...args: any[]) => {
    if (isDev) console.error(...logger(namespace, ...args));
  },

  log: (...args: any[]) => {
    if (isDev) console.log(...logger(namespace, ...args));
  },

  warn: (...args: any[]) => {
    if (isDev) console.warn(...logger(namespace, ...args));
  },
});

/**
 * Logger for statelyjs/ui
 */
export const devLog = devLogger(NAMESPACE);
