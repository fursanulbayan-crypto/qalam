import { RaceLevelConfig } from './raceConfig';

export interface ArabicRaceRound {
  id: string;
  /** Shown to the learner, e.g. "Round 1". */
  title: string;
  /** Items introduced in this round (not cumulative — the pool builder below unions this with earlier rounds). */
  newItems: string[];
  /** Correct catches needed to clear this round. */
  completionTarget: number;
  /** Race speed for this specific round — deliberately gentle for early rounds. */
  config: RaceLevelConfig;
}

export interface ArabicRaceStage {
  id: string;
  order: number; // 1-7, matches the learning path
  title: string;
  description: string;
  /**
   * Every stage is modelled as a list of rounds so the same engine handles
   * Stage 1's internal 3-round progression and every other stage's single
   * round without special-casing. Stages 2-7 just have one round.
   */
  rounds: ArabicRaceRound[];
}

// Deliberately gentle — a true beginner needs time to find each key.
// Speeds increase gradually round-to-round and stage-to-stage below.
function gentleConfig(spawnDelayMs: number, fallSpeed: number): RaceLevelConfig {
  return {
    spawnDelayMs,
    minSpawnDelayMs: Math.round(spawnDelayMs * 0.55),
    spawnDelayStepMs: Math.round(spawnDelayMs * 0.012),
    fallSpeed,
    fallSpeedStep: +(fallSpeed * 0.02).toFixed(4),
  };
}

export const ARABIC_RACE_STAGES: ArabicRaceStage[] = [
  {
    id: 'letters',
    order: 1,
    title: 'Arabic Letters',
    description: 'Learn where each letter lives on the keyboard, one small group at a time.',
    rounds: [
      {
        id: 'letters-r1',
        title: 'Round 1',
        // Home-row letters first (h f j l k g ; d) plus و — matches how a
        // physical typing course starts: the resting position of the fingers.
        // VERY SLOW: this is the learner's first contact with the keyboard —
        // priority is finding each key calmly, not reacting quickly.
        newItems: ['\u0627', '\u0628', '\u062a', '\u0645', '\u0646', '\u0644', '\u0643', '\u064a', '\u0648'],
        completionTarget: 12,
        config: gentleConfig(6500, 0.11),
      },
      {
        id: 'letters-r2',
        title: 'Round 2',
        // Mostly top-row letters, plus the two remaining home-row letters
        // (س ش) so Round 2 both extends reach and finishes off home row.
        // SLOW/MODERATE: a small step up now that Round 1 is familiar.
        newItems: ['\u062f', '\u0631', '\u0633', '\u0634', '\u0641', '\u0642', '\u0647', '\u062c', '\u062d'],
        completionTarget: 14,
        config: gentleConfig(5200, 0.15),
      },
      {
        id: 'letters-r3',
        title: 'Round 3',
        // Remaining letters. Hamza-carrying forms (ئ ء ؤ ى) are deliberately
        // left out of the pure-letters stage — they're context-dependent and
        // fit more naturally once combinations/words introduce them in context.
        // MODERATE: still clearly gentler than Stage 2, but comfortably faster than Round 1.
        newItems: [
          '\u062b', '\u062e', '\u0630', '\u0632', '\u0635',
          '\u0636', '\u0637', '\u0638', '\u0639', '\u063a', '\u0629',
        ],
        completionTarget: 16,
        config: gentleConfig(4400, 0.19),
      },
    ],
  },
  {
    id: 'combinations',
    order: 2,
    title: 'Letter Combinations',
    description: 'Two letters together — the first step from single keys to real typing rhythm.',
    rounds: [
      {
        id: 'combinations-r1',
        title: 'Round 1',
        newItems: ['\u0627\u0628', '\u0628\u062a', '\u0645\u0646', '\u0641\u064a', '\u0644\u0627', '\u0644\u0645', '\u0647\u0644', '\u0625\u0646', '\u0642\u062f', '\u0644\u0643', '\u0628\u0647', '\u064a\u062f'],
        completionTarget: 10,
        config: gentleConfig(3800, 0.24),
      },
    ],
  },
  {
    id: 'three-letter',
    order: 3,
    title: 'Three-letter Patterns',
    description: 'Simple three-letter words — short, familiar, and quick to complete.',
    rounds: [
      {
        id: 'three-letter-r1',
        title: 'Round 1',
        newItems: ['\u0643\u062a\u0628', '\u0639\u0644\u0645', '\u0642\u0644\u0645', '\u0628\u0627\u0628', '\u0628\u064a\u062a', '\u0646\u0648\u0631', '\u0642\u0645\u0631', '\u0634\u0645\u0633', '\u062f\u0631\u0633', '\u0642\u0644\u0628', '\u0635\u0628\u0631', '\u0646\u062c\u0645'],
        completionTarget: 10,
        config: gentleConfig(3400, 0.28),
      },
    ],
  },
  {
    id: 'short-words',
    order: 4,
    title: 'Short Arabic Words',
    description: 'Familiar 3-5 letter words, including everyday Islamic vocabulary.',
    rounds: [
      {
        id: 'short-words-r1',
        title: 'Round 1',
        newItems: ['\u0643\u062a\u0627\u0628', '\u0645\u0633\u062c\u062f', '\u0645\u0639\u0644\u0645', '\u0645\u062f\u0631\u0633\u0629', '\u0637\u0627\u0644\u0628', '\u0642\u0631\u0622\u0646', '\u062c\u0645\u064a\u0644', '\u0643\u0628\u064a\u0631', '\u0635\u063a\u064a\u0631', '\u0633\u0644\u0627\u0645', '\u062c\u0627\u0645\u0639\u0629', '\u062d\u062f\u064a\u0642\u0629'],
        completionTarget: 8,
        config: gentleConfig(3000, 0.32),
      },
    ],
  },
  {
    id: 'longer-words',
    order: 5,
    title: 'Longer Words',
    description: 'Words with the definite article and longer roots.',
    rounds: [
      {
        id: 'longer-words-r1',
        title: 'Round 1',
        newItems: ['\u0627\u0644\u0645\u062f\u0631\u0633\u0629', '\u0627\u0644\u0645\u0633\u0644\u0645\u0648\u0646', '\u0627\u0644\u0645\u0639\u0644\u0645', '\u0627\u0644\u0645\u0643\u062a\u0628\u0629', '\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a', '\u0627\u0644\u0637\u0627\u0644\u0628\u0627\u062a', '\u0627\u0644\u062a\u0639\u0644\u064a\u0645', '\u0627\u0644\u062d\u062f\u064a\u0642\u0629'],
        completionTarget: 6,
        config: gentleConfig(2800, 0.36),
      },
    ],
  },
  {
    id: 'phrases',
    order: 6,
    title: 'Short Phrases',
    description: 'Two words together — reading and typing a small idea at once.',
    rounds: [
      {
        id: 'phrases-r1',
        title: 'Round 1',
        newItems: ['\u0637\u0644\u0628 \u0627\u0644\u0639\u0644\u0645', '\u0646\u0648\u0631 \u0627\u0644\u0639\u0644\u0645', '\u0628\u0633\u0645 \u0627\u0644\u0644\u0647', '\u0643\u062a\u0627\u0628 \u0645\u0641\u064a\u062f', '\u0637\u0627\u0644\u0628 \u0645\u062c\u062a\u0647\u062f', '\u0627\u0644\u0639\u0644\u0645 \u0646\u0648\u0631', '\u0645\u0639\u0644\u0645 \u0645\u062c\u062a\u0647\u062f', '\u0628\u0627\u0631\u0643 \u0627\u0644\u0644\u0647'],
        completionTarget: 5,
        config: gentleConfig(2600, 0.3),
      },
    ],
  },
  {
    id: 'sentences',
    order: 7,
    title: 'Short Sentences',
    description: 'Complete simple sentences — the finish line of the Arabic Race path.',
    rounds: [
      {
        id: 'sentences-r1',
        title: 'Round 1',
        newItems: [
          '\u0627\u0644\u0639\u0644\u0645 \u0646\u0648\u0631.',
          '\u0637\u0644\u0628 \u0627\u0644\u0639\u0644\u0645 \u0641\u0631\u064a\u0636\u0629.',
          '\u0627\u0644\u0645\u0633\u0644\u0645 \u064a\u062d\u0628 \u0627\u0644\u062e\u064a\u0631.',
          '\u0627\u0644\u0642\u0631\u0627\u0621\u0629 \u0645\u0641\u064a\u062f\u0629.',
          '\u0627\u0644\u0635\u0628\u0631 \u0645\u0641\u062a\u0627\u062d \u0627\u0644\u0641\u0631\u062c.',
          '\u0627\u0644\u0639\u0644\u0645 \u064a\u0628\u0646\u064a \u0627\u0644\u0623\u0645\u0645.',
        ],
        completionTarget: 4,
        config: gentleConfig(2400, 0.26),
      },
    ],
  },
];

export function getStageById(id: string): ArabicRaceStage | undefined {
  return ARABIC_RACE_STAGES.find((s) => s.id === id);
}

/** Union of every round's newItems up to and including roundIndex — gives the "mix old with new" pool. */
export function getRoundPool(stage: ArabicRaceStage, roundIndex: number): string[] {
  const clamped = Math.max(0, Math.min(roundIndex, stage.rounds.length - 1));
  const pool: string[] = [];
  for (let i = 0; i <= clamped; i++) pool.push(...stage.rounds[i].newItems);
  return pool;
}
