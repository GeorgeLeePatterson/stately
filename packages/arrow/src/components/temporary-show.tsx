import { useCallback, useEffect, useRef, useState } from 'react';

export const DEFAULT_TIMEOUT = 5000; // ms

/**
 * TimedHide - timed in 'ms'
 */
export function TemporaryShow({
  showKey,
  timeout = DEFAULT_TIMEOUT,
  children,
}: React.PropsWithChildren<{ showKey: string; timeout?: number }>) {
  const isShowingRef = useRef(false);
  const [isShowing, setIsShowing] = useState(false);

  const timerEffect = useCallback(() => {
    // Start showing
    setIsShowing(true);
    isShowingRef.current = true;
    const timer = setTimeout(() => {
      // Finish showing
      setIsShowing(false);
      isShowingRef.current = false;
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  useEffect(() => {
    // TODO: Remove
    console.debug('IsShowing: ', { isShowingRef, showKey });

    // If showKey is off, hide
    if (!showKey) {
      setIsShowing(false);
      isShowingRef.current = false;
      return;
    }

    // If already showing, do nothing
    if (isShowingRef.current) {
      return;
    }

    // Otherwise, start showing
    return timerEffect();
  }, [showKey, timerEffect]);

  // TODO: Remove
  console.debug('IsShowing: ', { isShowing, isShowingRef });

  return isShowing ? <>{children}</> : null;
}
