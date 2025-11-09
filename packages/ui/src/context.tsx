import { createContext, type PropsWithChildren, useContext } from 'react';
import type { StatelyCore } from './runtime';

const StatelyUiContext = createContext<StatelyCore | null>(null);

export function StatelyUiProvider({ value, children }: PropsWithChildren<{ value: StatelyCore }>) {
  return <StatelyUiContext.Provider value={value}>{children}</StatelyUiContext.Provider>;
}

export function useStatelyUi(): StatelyCore {
  const ctx = useContext(StatelyUiContext);
  if (!ctx) throw new Error('useStatelyUi must be used within a StatelyUiProvider');
  return ctx;
}
