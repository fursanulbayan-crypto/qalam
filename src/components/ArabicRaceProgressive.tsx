'use client';

import { useEffect, useState } from 'react';
import { getStageById, getRoundPool } from '@/lib/content/arabicRaceProgression';
import { useArabicRaceProgress } from '@/hooks/useArabicRaceProgress';
import RaceView from './RaceView';

export default function ArabicRaceProgressive({ stageId }: { stageId: string }) {
  const progress = useArabicRaceProgress();
  const [banner, setBanner] = useState<string | null>(null);

  const stage = getStageById(stageId);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 3000);
    return () => clearTimeout(t);
  }, [banner]);

  if (!progress.hydrated || !stage) {
    return (
      <div className="stage">
        <div className="center-panel">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const roundIndex = progress.getRoundIndex(stage.id);
  const round = stage.rounds[roundIndex];
  const pool = getRoundPool(stage, roundIndex);
  const catches = progress.getCatches(stage.id, roundIndex);
  const pct = Math.min(100, Math.round((catches / round.completionTarget) * 100));

  function handleCaught() {
    const result = progress.recordCatch(stage!, roundIndex);
    if (result.stageCompleted) {
      setBanner(`Stage ${stage!.order} complete! ${stage!.order < 7 ? 'Next stage unlocked.' : "You've reached the end of the Arabic Race path."}`);
    } else if (result.roundAdvanced) {
      setBanner(`Round ${roundIndex + 1} complete! Moving to Round ${roundIndex + 2}.`);
    }
  }

  return (
    <div>
      <div className="race-stage-banner">
        Stage {stage.order} {'\u00b7'} {stage.title}
        {stage.rounds.length > 1 ? ` \u00b7 Round ${roundIndex + 1} of ${stage.rounds.length}` : ''}
      </div>
      <div className="race-progress-track">
        <div className="race-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', margin: '6px 0 18px' }}>
        {catches} / {round.completionTarget} caught this round
      </p>
      {banner && (
        <p style={{ fontSize: 13, color: 'var(--gold)', textAlign: 'center', marginTop: -10, marginBottom: 16 }}>
          {banner}
        </p>
      )}

      <RaceView
        key={`${stage.id}:${roundIndex}`}
        language="ar"
        words={pool}
        config={round.config}
        statsId={`arabic-progression-${stage.id}`}
        onWordCaught={handleCaught}
      />
    </div>
  );
}
