'use client';

import { useCallback, useEffect, useState } from 'react';

function storageKey(namespace: string, id: string) {
  return `qalam-best:${namespace}:${id}`;
}

// Tracks a single "higher is better" number (WPM, score, ...) per namespace+id
// in localStorage. No account, no server round-trip. Safe if localStorage is
// unavailable (private browsing, quota, SSR) — it just won't persist.
export function usePersistedBest(namespace: string, id: string) {
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(storageKey(namespace, id));
      setBest(raw ? JSON.parse(raw).value : null);
    } catch {
      setBest(null);
    }
  }, [namespace, id]);

  const record = useCallback(
    (value: number) => {
      setBest((prev) => {
        if (prev !== null && value <= prev) return prev;
        try {
          window.localStorage.setItem(
            storageKey(namespace, id),
            JSON.stringify({ value, date: new Date().toISOString() })
          );
        } catch {
          // Ignore — best-score just won't persist this session.
        }
        return value;
      });
    },
    [namespace, id]
  );

  return { best, record };
}
