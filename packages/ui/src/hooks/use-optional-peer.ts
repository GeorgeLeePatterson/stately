import { useEffect, useState } from 'react';
import { devLog } from '@/lib/logging';

export type PeerStatus = 'checking' | 'available' | 'unavailable';

export function useOptionalPeer(moduleId: string) {
  const [status, setStatus] = useState<PeerStatus>('checking');

  useEffect(() => {
    let cancelled = false;

    // reset to checking when moduleId changes
    setStatus('checking');

    const url = import.meta.resolve(moduleId);
    devLog.debug('Hooks', `Module ${moduleId} using url ${url}`, { cancelled });

    (async () => {
      try {
        const mod = await import(url);
        devLog.debug('Hooks', `Module ${moduleId} loaded`, { cancelled, url });
        if (!mod?.default && !Object.keys(mod ?? {}).length) {
          // TODO: (dev) decide whether this should throw
          devLog.warn('Hooks', `Module ${moduleId} doesn't seem usable`);
          // throw new Error("Empty module")
        }
        if (!cancelled) setStatus(prev => (prev === 'available' ? prev : 'available'));
      } catch (e) {
        devLog.warn('Hooks', `Module ${moduleId} failed to load`, { cancelled, error: e });
        if (!cancelled) setStatus(prev => (prev === 'unavailable' ? prev : 'unavailable'));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  useEffect(
    () => devLog.debug('Hooks', `  ${moduleId} status check changed`, { status }),
    [status, moduleId],
  );

  return status;
}
