import { useArrowStatelyUi } from '@/context';

export function useArrowApi() {
  const { plugins } = useArrowStatelyUi();
  return plugins.arrow?.api;
}
