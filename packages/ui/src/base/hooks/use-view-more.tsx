import { useMemo, useState } from 'react';

export function useViewMore(data: any, limit: number) {
  const [viewMore, setViewMore] = useState(false);

  const existingView = useMemo(() => {
    const view = typeof data === 'object' && !!data ? Object.entries(data) || [] : [];
    if (viewMore || view.length <= limit) {
      return view;
    }
    return view.slice(0, limit);
  }, [data, viewMore, limit]);

  return [existingView, viewMore, setViewMore] as const;
}
