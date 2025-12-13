import { useCallback, useEffect, useRef, useState } from 'react';

export const CLICK_TRACK_STORAGE_KEY = 'stately-click-tracking';

export interface ClickTrack {
  path: string;
  label: string;
  count: number;
}

export function useClickTracking() {
  const loaded = useRef<boolean>(false);
  const [topClicks, setTopClicks] = useState<ClickTrack[]>([]);

  const loadTopClicks = useCallback(() => {
    try {
      const data = localStorage.getItem(CLICK_TRACK_STORAGE_KEY);
      if (data) {
        const clicks: Record<string, ClickTrack> = JSON.parse(data);
        const sorted = Object.values(clicks)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setTopClicks(sorted);
      }
    } catch (error) {
      console.error('Failed to load click tracking:', error);
    }
  }, []);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    loadTopClicks();
  }, [loadTopClicks]);

  const trackClick = useCallback(
    (path: string, label: string) => {
      try {
        const data = localStorage.getItem(CLICK_TRACK_STORAGE_KEY);
        const clicks: Record<string, ClickTrack> = data ? JSON.parse(data) : {};

        if (clicks[path]) {
          clicks[path].count += 1;
        } else {
          clicks[path] = { count: 1, label, path };
        }

        localStorage.setItem(CLICK_TRACK_STORAGE_KEY, JSON.stringify(clicks));
        loadTopClicks();
      } catch (error) {
        console.error('Failed to track click:', error);
      }
    },
    [loadTopClicks],
  );

  return { topClicks, trackClick };
}
