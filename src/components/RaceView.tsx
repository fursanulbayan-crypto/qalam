'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Language } from '@/lib/content/types';
import { RaceLevelConfig } from '@/lib/content/raceConfig';
import { buildRaceWordPool } from '@/lib/content/raceProgression';
import { usePersistedBest } from '@/hooks/usePersistedBest';
import StatsBar from './StatsBar';
import Keyboard from './Keyboard';

interface FallingWord {
  id: number;
  text: string;
  typed: string;
  top: number;
  left: number;
  /** Set the instant a word is caught or missed — it stops moving and plays
   *  a brief animation before being removed from state entirely. */
  status?: 'caught' | 'missed';
}

const SKY_HEIGHT = 280;
const FOLD_MARGIN = 20;
const DANGER_MARGIN = 60;
// Must match the CSS animation durations for .caught / .missed-anim in globals.css.
const CATCH_ANIM_MS = 350;
const MISS_ANIM_MS = 400;

export default function RaceView({
  language,
  words,
  config,
  statsId,
  onWordCaught,
}: {
  language: Language;
  words: string[];
  config: RaceLevelConfig;
  /** Identifies this selection for best-score persistence, e.g. "ar-beginner" or "authentic". Omit to skip tracking. */
  statsId?: string;
  /** Fired once per successful catch, after score/state updates. Optional — used by the Arabic Race progression wrapper only. */
  onWordCaught?: (word: string) => void;
}) {
  const [phase, setPhase] = useState<'idle' | 'active' | 'over'>('idle');
  const [isPaused, setIsPaused] = useState(false);
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [correctKeys, setCorrectKeys] = useState(0);
  const [totalKeys, setTotalKeys] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);

  const { best, record } = usePersistedBest('race-score', statsId || `${language}-adhoc`);

  const skyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(0);
  const catchesRef = useRef(0);
  const spawnDelayRef = useRef(config.spawnDelayMs);
  const fallSpeedRef = useRef(config.fallSpeed);
  const rafRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef(false);
  // Mirrors isPaused for synchronous reads inside the rAF loop (state
  // updates aren't visible mid-frame the way a ref is).
  const pausedRef = useRef(false);
  // Total time spent paused, subtracted from elapsed time so WPM doesn't
  // dip just because the player paused to do something else.
  const pausedDurationRef = useRef(0);
  const pauseStartRef = useRef<number | null>(null);

  const pickWord = useCallback(() => {
    const pool = buildRaceWordPool(words, language, catchesRef.current);
    if (!pool.length) return words.length ? words[Math.floor(Math.random() * words.length)] : '...';
    return pool[Math.floor(Math.random() * pool.length)];
  }, [words, language]);

  const spawnWord = useCallback(() => {
    const skyWidth = skyRef.current?.clientWidth ?? 500;
    const maxLeft = Math.max(skyWidth - 100, 40);
    idCounter.current += 1;
    setFallingWords((prev) => [
      ...prev,
      { id: idCounter.current, text: pickWord(), typed: '', top: -30, left: Math.floor(Math.random() * maxLeft) },
    ]);
  }, [pickWord]);

  const stopTimers = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
  }, []);

  const endRace = useCallback(() => {
    activeRef.current = false;
    stopTimers();
    setPhase('over');
    setIsPaused(false);
    pausedRef.current = false;
    setScore((s) => {
      record(s);
      return s;
    });
  }, [stopTimers, record]);

  useEffect(() => {
    if (phase !== 'active') return;
    let lastTime = performance.now();

    function tick(now: number) {
      if (!activeRef.current) return;
      if (pausedRef.current) {
        // Keep the loop alive but do nothing, and keep resetting lastTime so
        // there's no huge dt jump (which would yank every word downward) the
        // instant the player resumes.
        lastTime = now;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const dt = now - lastTime;
      lastTime = now;
      setFallingWords((prev) => {
        const next: FallingWord[] = [];
        const justMissed: FallingWord[] = [];
        for (const w of prev) {
          if (w.status) {
            next.push(w);
            continue;
          }
          const newTop = w.top + fallSpeedRef.current * (dt / 16.6);
          if (newTop >= SKY_HEIGHT - FOLD_MARGIN) {
            const missedWord: FallingWord = { ...w, top: newTop, status: 'missed' };
            justMissed.push(missedWord);
            next.push(missedWord);
          } else {
            next.push({ ...w, top: newTop });
          }
        }
        if (justMissed.length && activeRef.current) {
          for (const w of justMissed) {
            setTimeout(() => {
              setFallingWords((p) => p.filter((x) => x.id !== w.id));
            }, MISS_ANIM_MS);
          }
          setLives((l) => {
            const nextLives = Math.max(0, l - 1);
            if (l > 0 && nextLives === 0) {
              endRace();
            }
            return nextLives;
          });
        }
        return next;
      });
      if (activeRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, endRace]);

  useEffect(() => {
    if (phase !== 'active' || !startTime) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const elapsed = (Date.now() - startTime - pausedDurationRef.current) / 1000;
      setWpm(elapsed > 0 ? Math.round(correctKeys / 5 / (elapsed / 60)) : 0);
    }, 250);
    return () => clearInterval(id);
  }, [phase, startTime, correctKeys]);

  function startRace() {
    activeRef.current = true;
    pausedRef.current = false;
    pausedDurationRef.current = 0;
    pauseStartRef.current = null;
    setIsPaused(false);
    setPhase('active');
    setLives(3);
    setScore(0);
    setFallingWords([]);
    setCorrectKeys(0);
    setTotalKeys(0);
    setWpm(0);
    setInputValue('');
    catchesRef.current = 0;
    spawnDelayRef.current = config.spawnDelayMs;
    fallSpeedRef.current = config.fallSpeed;
    setStartTime(Date.now());
    spawnWord();
    spawnTimerRef.current = setInterval(spawnWord, spawnDelayRef.current);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function pauseRace() {
    if (phase !== 'active' || pausedRef.current) return;
    pausedRef.current = true;
    setIsPaused(true);
    pauseStartRef.current = Date.now();
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
  }

  function resumeRace() {
    if (!pausedRef.current) return;
    if (pauseStartRef.current !== null) {
      pausedDurationRef.current += Date.now() - pauseStartRef.current;
      pauseStartRef.current = null;
    }
    pausedRef.current = false;
    setIsPaused(false);
    spawnTimerRef.current = setInterval(spawnWord, spawnDelayRef.current);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function restartSpawnTimer() {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    spawnTimerRef.current = setInterval(spawnWord, spawnDelayRef.current);
  }

  function handleChange(value: string) {
    if (value.length > 0) setTotalKeys((k) => k + 1);
    const target = value.length > 0 ? fallingWords.find((w) => !w.status && w.text.startsWith(value)) : undefined;
    if (target) {
      setFallingWords((prev) => prev.map((w) => (w.id === target.id ? { ...w, typed: value } : w)));
      if (value === target.text) {
        setCorrectKeys((k) => k + value.length);
        setScore((s) => s + target.text.length * 10);
        setFallingWords((prev) => prev.map((w) => (w.id === target.id ? { ...w, status: 'caught' } : w)));
        setTimeout(() => {
          setFallingWords((prev) => prev.filter((w) => w.id !== target.id));
        }, CATCH_ANIM_MS);
        setInputValue('');
        catchesRef.current += 1;
        onWordCaught?.(target.text);
        if (spawnDelayRef.current > config.minSpawnDelayMs) {
          spawnDelayRef.current -= config.spawnDelayStepMs;
          restartSpawnTimer();
        }
        fallSpeedRef.current += config.fallSpeedStep;
        return;
      }
      setInputValue(value);
    } else if (value.length > 0) {
      setInputValue('');
    } else {
      setInputValue(value);
    }
  }

  useEffect(() => {
    return () => {
      activeRef.current = false;
      stopTimers();
    };
  }, [stopTimers]);

  const accuracy = totalKeys > 0 ? Math.min(100, Math.round((correctKeys / totalKeys) * 100)) : 100;
  const errors = Math.max(0, totalKeys - correctKeys);
  const nextChar =
    inputValue.length > 0
      ? fallingWords.find((w) => !w.status && w.text.startsWith(inputValue))?.text[inputValue.length] ?? null
      : null;

  return (
    <>
      <StatsBar
        wpm={wpm}
        accuracy={accuracy}
        errors={errors}
        lives={lives}
        score={score}
        best={best}
        bestLabel="Best score"
        showTime={false}
        showRaceStats
      />

      <div className="stage">
        {phase === 'idle' && (
          <div className="center-panel">
            <h2>Words fall. You catch them.</h2>
            <p>Type each word before it reaches the fold line. Three misses and the page is lost.</p>
            <button className="primary-btn" onClick={startRace} disabled={!words.length}>
              Start race
            </button>
            {!words.length && <p style={{ marginTop: 12 }}>No word list loaded for this selection yet.</p>}
          </div>
        )}

        {phase === 'active' && (
          <>
            {!isPaused && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <button className="secondary-btn" onClick={pauseRace}>
                  {'\u23F8'} Pause
                </button>
              </div>
            )}
            <div className="sky" ref={skyRef}>
              {fallingWords.map((w) => (
                <div
                  key={w.id}
                  className={`falling-word lang-${language}${w.status === 'caught' ? ' caught' : ''}${
                    w.status === 'missed' ? ' missed-anim' : ''
                  }${!w.status && w.top > SKY_HEIGHT - DANGER_MARGIN ? ' danger-zone' : ''}`}
                  style={{ top: w.top, left: w.left }}
                >
                  <span className="matched">{w.typed}</span>
                  {w.text.slice(w.typed.length)}
                </div>
              ))}
              {isPaused && (
                <div className="race-pause-overlay">
                  <div className="race-pause-panel">
                    <h3>Paused</h3>
                    <button className="primary-btn" onClick={resumeRace}>
                      {'\u25B6'} Resume
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="fold-label">the fold</div>
          </>
        )}

        {phase === 'over' && (
          <div className="center-panel">
            <h2>The page is lost</h2>
            <p>
              Final score {score}
              {best !== null && score >= best ? ' — new best!' : best !== null ? `. Best: ${best}` : '.'}
            </p>
            <button className="primary-btn" onClick={startRace}>
              Try again
            </button>
          </div>
        )}
      </div>

      {phase === 'active' && !isPaused && (
        <input
          ref={inputRef}
          type="text"
          className={`type-input lang-${language}`}
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      )}

      <Keyboard language={language} nextChar={isPaused ? null : nextChar} />
    </>
  );
}
