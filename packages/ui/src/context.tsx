import { createContext, type PropsWithChildren, useContext } from 'react';
import type { CoreSchemaData, CoreSchemaUtils } from '@/core/types';
import type { StatelyCore } from './runtime';

const StatelyUiContext = createContext<StatelyCore | null>(null);

export function StatelyUiProvider({ value, children }: PropsWithChildren<{ value: StatelyCore }>) {
  return <StatelyUiContext.Provider value={value}>{children}</StatelyUiContext.Provider>;
}

type AugmentedStatelyCore = StatelyCore & {
  schema: StatelyCore['schema'] & {
    utils: StatelyCore['schema']['utils'] & CoreSchemaUtils;
    data: StatelyCore['schema']['data'] & CoreSchemaData;
  };
};

export function useStatelyUi(): AugmentedStatelyCore {
  const ctx = useContext(StatelyUiContext);
  if (!ctx) throw new Error('useStatelyUi must be used within a StatelyUiProvider');
  return ctx as AugmentedStatelyCore;
}
