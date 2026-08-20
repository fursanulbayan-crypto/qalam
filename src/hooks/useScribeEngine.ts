'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { QalamContent } from '@/lib/content/types';

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function useScribeEngine(content: QalamContent | null) {
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [totalKeys, setTotalKeys] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setTyped('');
    setStartTime(null);
    setElapsed(0);
    setTotalKeys(0);
    setDone(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [content?.id]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleInput = useCallback(
    (value: string) => {
      if (!content || done) return;
      if (!startTime) {
        const now = Date.now();
        setStartTime(now);
        intervalRef.current = setInterval(() => {
          setElapsed((Date.now() - now) / 1000);
        }, 250);
      }
      if (value.length > typed.length) {
        setTotalKeys((k) => k + 1);
      }
      setTyped(value);
      if (value.length >= content.text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDone(true);
      }
    },
    [content, done, startTime, typed.length]
  );

  const correctChars = content ? typed.split('').filter((c, i) => c === content.text[i]).length : 0;
  const wpm = elapsed > 0 ? Math.round(correctChars / 5 / (elapsed / 60)) : 0;
  const accuracy = totalKeys > 0 ? Math.min(100, Math.round((correctChars / totalKeys) * 100)) : 100;
  const errors = Math.max(0, totalKeys - correctChars);
  const nextChar = content ? content.text[typed.length] ?? null : null;

  return {
    typed,
    handleInput,
    wpm,
    accuracy,
    errors,
    elapsedLabel: fmtTime(elapsed),
    elapsedSeconds: elapsed,
    done,
    nextChar,
    correctChars,
  };
}
