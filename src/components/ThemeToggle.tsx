'use client';

import { useEffect, useState } from 'react';
import { ThemePreference, THEME_STORAGE_KEY, resolveTheme } from '@/lib/theme';

export default function ThemeToggle() {
  const [pref, setPref] = useState<ThemePreference>('system');
  // Guards the effect below from ever writing to localStorage before the
  // stored preference has actually been read. Without this, both effects
  // run on mount using pref's stale default ('system'), and the
  // apply+persist effect below would overwrite a genuinely-stored
  // "light"/"dark" value back to "system" before the read effect's update
  // had taken effect.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') setPref(stored);
    } catch {
      // localStorage unavailable — default preference stands for this session.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.setAttribute('data-theme', resolveTheme(pref));
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, pref);
    } catch {
      // Preference just won't persist across sessions.
    }

    if (pref !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => document.documentElement.setAttribute('data-theme', resolveTheme('system'));
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [pref, hydrated]);

  return (
    <div className="toggle-group" aria-label="Theme">
      <button className={pref === 'system' ? 'active' : ''} onClick={() => setPref('system')}>
        System
      </button>
      <button className={pref === 'light' ? 'active' : ''} onClick={() => setPref('light')}>
        Light
      </button>
      <button className={pref === 'dark' ? 'active' : ''} onClick={() => setPref('dark')}>
        Dark
      </button>
    </div>
  );
}
