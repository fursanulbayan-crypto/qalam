'use client';

import { useCallback, useEffect, useState } from 'react';
import { ARABIC_RACE_STAGES, ArabicRaceStage } from '@/lib/content/arabicRaceProgression';

const STORAGE_KEY = 'qalam-arabic-race-progress';

interface ProgressState {
  /** Highest stage order (1-7) the learner may enter. */
  unlockedOrder: number;
  /** Stage ids fully completed (all rounds cleared). */
  completedStageIds: string[];
  /** Which round index is currently active, per stage id. */
  roundIndexByStage: Record<string, number>;
  /** Catches recorded toward the current round, keyed "stageId:roundIndex". */
  catches: Record<string, number>;
}

const DEFAULT_STATE: ProgressState = {
  unlockedOrder: 1,
  completedStageIds: [],
  roundIndexByStage: {},
  catches: {},
};

function loadState(): ProgressState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return {
      unlockedOrder: typeof parsed.unlockedOrder === 'number' ? parsed.unlockedOrder : 1,
      completedStageIds: Array.isArray(parsed.completedStageIds) ? parsed.completedStageIds : [],
      roundIndexByStage: parsed.roundIndexByStage && typeof parsed.roundIndexByStage === 'object' ? parsed.roundIndexByStage : {},
      catches: parsed.catches && typeof parsed.catches === 'object' ? parsed.catches : {},
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveState(state: ProgressState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Progress just won't persist this session.
  }
}

export function useArabicRaceProgress() {
  const [state, setState] = useState<ProgressState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  const isStageUnlocked = useCallback((order: number) => order <= state.unlockedOrder, [state.unlockedOrder]);
  const isStageCompleted = useCallback((stageId: string) => state.completedStageIds.includes(stageId), [state.completedStageIds]);
  const getRoundIndex = useCallback((stageId: string) => state.roundIndexByStage[stageId] ?? 0, [state.roundIndexByStage]);
  const getCatches = useCallback((stageId: string, roundIndex: number) => state.catches[`${stageId}:${roundIndex}`] ?? 0, [state.catches]);

  /** Call once per successful word catch. Returns what just happened, for UI feedback. */
  const recordCatch = useCallback(
    (stage: ArabicRaceStage, roundIndex: number): { roundAdvanced: boolean; stageCompleted: boolean } => {
      let roundAdvanced = false;
      let stageCompleted = false;

      setState((prev) => {
        const key = `${stage.id}:${roundIndex}`;
        const before = prev.catches[key] ?? 0;
        const after = before + 1;
        const nextCatches = { ...prev.catches, [key]: after };
        const round = stage.rounds[roundIndex];
        // Only treat this as "just cleared" if this exact catch crossed the
        // target — otherwise a learner who keeps playing past completion
        // would re-trigger the completion event on every further catch.
        const justCleared = before < round.completionTarget && after >= round.completionTarget;

        let next: ProgressState = { ...prev, catches: nextCatches };

        if (justCleared) {
          const isLastRound = roundIndex >= stage.rounds.length - 1;
          if (isLastRound) {
            stageCompleted = true;
            const alreadyCompleted = prev.completedStageIds.includes(stage.id);
            next = {
              ...next,
              completedStageIds: alreadyCompleted ? prev.completedStageIds : [...prev.completedStageIds, stage.id],
              unlockedOrder: Math.max(prev.unlockedOrder, stage.order + 1),
            };
          } else {
            roundAdvanced = true;
            next = {
              ...next,
              roundIndexByStage: { ...prev.roundIndexByStage, [stage.id]: roundIndex + 1 },
            };
          }
        }

        saveState(next);
        return next;
      });

      return { roundAdvanced, stageCompleted };
    },
    []
  );

  return {
    hydrated,
    stages: ARABIC_RACE_STAGES,
    isStageUnlocked,
    isStageCompleted,
    getRoundIndex,
    getCatches,
    recordCatch,
  };
}
