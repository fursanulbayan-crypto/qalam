import { AR_KEY_ROWS } from './keyboardLayouts';
import { Language } from './types';

// Every base Arabic letter from the verified Arabic 101 layout (excludes the
// number row / punctuation keys) — used as the very first Race stage so a
// true beginner meets one key at a time before any whole word appears.
export const ARABIC_ALPHABET: string[] = Array.from(
  new Set(AR_KEY_ROWS.flatMap((row) => row.map((k) => k.base)).filter((ch) => /^[\u0621-\u064A]$/.test(ch)))
);

// How many words must be caught before the pool is allowed to include the
// next length tier. Kept small and uniform so growth feels steady rather
// than jumpy.
const CATCHES_PER_STAGE = 4;

// Given the full word list for a level, returns the subset that should be
// eligible to spawn right now, based on how many words the learner has
// already caught in this run.
//
// Arabic: stage 0 is single letters (not drawn from the word list at all —
// synthesized from the keyboard itself); stage 1+ progressively allows
// longer words (<=2 chars, <=3, <=4, ...) until the full list is available.
// English: no single-letter stage (not what was asked for), but the same
// "shorter words first" ramp applies using the level's own word list.
export function buildRaceWordPool(words: string[], language: Language, catches: number): string[] {
  const stage = Math.floor(catches / CATCHES_PER_STAGE);

  if (language === 'ar') {
    if (stage === 0) return ARABIC_ALPHABET;
    const maxLen = stage + 1; // stage 1 -> <=2 chars, stage 2 -> <=3, ...
    const pool = words.filter((w) => w.length <= maxLen);
    return pool.length ? pool : words;
  }

  const maxLen = 2 + stage; // English words are rarely 1 char, start a little longer
  const pool = words.filter((w) => w.length <= maxLen);
  return pool.length ? pool : words;
}
