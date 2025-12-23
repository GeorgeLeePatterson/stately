import { useMemo, useState } from 'react';

export function useViewMore(data: any, limit: number) {
  const [viewMore, setViewMore] = useState(false);

  const items = useMemo(
    () => (typeof data === 'object' && !!data ? Object.entries(data) || [] : []),
    [data],
  );

  const viewing = useMemo(() => {
    if (viewMore || items.length <= limit) {
      return items;
    }
    return items.slice(0, limit);
  }, [items, viewMore, limit]);

  return [viewing, items, viewMore, setViewMore] as const;
}
