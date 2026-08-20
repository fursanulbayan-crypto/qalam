import { Language, Level } from './types';

export interface RaceLevelConfig {
  /** Milliseconds between word spawns at the start of a run. */
  spawnDelayMs: number;
  /** Spawn delay never ramps faster than this floor. */
  minSpawnDelayMs: number;
  /** How much the spawn delay shrinks (ms) each time a word is caught. */
  spawnDelayStepMs: number;
  /** Pixels of fall per animation frame (~60fps) at the start of a run. */
  fallSpeed: number;
  /** How much fall speed increases each time a word is caught. */
  fallSpeedStep: number;
}

// Centralised so tuning never means hunting through component code.
// Arabic starts noticeably slower than its English counterpart at every
// level — reading an unfamiliar script and locating a shifted key both take
// longer than reading Latin script, so the same numeric speed would feel far
// harder in Arabic. Steps are kept small so the ramp is gradual rather than
// a sudden jump mid-run.
export const RACE_CONFIG: Record<Language, Record<Level, RaceLevelConfig>> = {
  en: {
    beginner: { spawnDelayMs: 3200, minSpawnDelayMs: 1700, spawnDelayStepMs: 25, fallSpeed: 0.32, fallSpeedStep: 0.006 },
    intermediate: { spawnDelayMs: 2500, minSpawnDelayMs: 1300, spawnDelayStepMs: 30, fallSpeed: 0.46, fallSpeedStep: 0.008 },
    pro: { spawnDelayMs: 1900, minSpawnDelayMs: 900, spawnDelayStepMs: 35, fallSpeed: 0.62, fallSpeedStep: 0.011 },
  },
  ar: {
    beginner: { spawnDelayMs: 4200, minSpawnDelayMs: 2300, spawnDelayStepMs: 18, fallSpeed: 0.22, fallSpeedStep: 0.004 },
    intermediate: { spawnDelayMs: 3300, minSpawnDelayMs: 1700, spawnDelayStepMs: 22, fallSpeed: 0.32, fallSpeedStep: 0.006 },
    pro: { spawnDelayMs: 2600, minSpawnDelayMs: 1300, spawnDelayStepMs: 28, fallSpeed: 0.44, fallSpeedStep: 0.008 },
  },
};

// Used when Race is fed from an Authentic Source passage rather than a
// practice level (there's no "level" for a Qur'an ayah). Arabic Beginner is
// the safe, readable default — the learner is very likely seeing unfamiliar
// vocabulary for the first time.
export const AUTHENTIC_RACE_CONFIG: RaceLevelConfig = RACE_CONFIG.ar.beginner;
