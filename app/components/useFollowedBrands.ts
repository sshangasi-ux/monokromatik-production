'use client';

import { useCallback, useSyncExternalStore } from 'react';

// Anonymous "follow a brand" — persisted in localStorage so it works without an
// account. (Email score-alerts layer on once registration exists.) Read via
// useSyncExternalStore: SSR-safe, no effect-setState, and all mounted instances
// stay in sync via a custom event + the native storage event.
const KEY = 'mk:followed-brands';
const EVT = 'mk:followed-changed';
const EMPTY: string[] = [];

let cache: string[] = EMPTY;
let cacheRaw = '';

function getSnapshot(): string[] {
  if (typeof window === 'undefined') return EMPTY;
  const raw = localStorage.getItem(KEY) || '[]';
  // Return a stable reference while the stored value is unchanged.
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      const v = JSON.parse(raw);
      cache = Array.isArray(v) ? v : EMPTY;
    } catch {
      cache = EMPTY;
    }
  }
  return cache;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

function subscribe(cb: () => void): () => void {
  window.addEventListener(EVT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener('storage', cb);
  };
}

export function useFollowedBrands() {
  const followed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((slug: string) => {
    const cur = getSnapshot();
    const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVT));
  }, []);

  const has = useCallback((slug: string) => followed.includes(slug), [followed]);

  return { followed, has, toggle, count: followed.length, ready: true };
}
