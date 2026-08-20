'use client';

import { useArabicRaceProgress } from '@/hooks/useArabicRaceProgress';

export default function ArabicRaceStagePicker({
  selectedStageId,
  onSelectStage,
}: {
  selectedStageId: string | null;
  onSelectStage: (stageId: string) => void;
}) {
  const progress = useArabicRaceProgress();

  if (!progress.hydrated) {
    return <p style={{ fontSize: 13, color: 'var(--muted)' }}>Loading your progress...</p>;
  }

  return (
    <div className="surah-list" style={{ maxHeight: 'none' }}>
      {progress.stages.map((stage) => {
        const unlocked = progress.isStageUnlocked(stage.order);
        const completed = progress.isStageCompleted(stage.id);
        const roundIndex = progress.getRoundIndex(stage.id);
        const isSelected = selectedStageId === stage.id;

        return (
          <div
            key={stage.id}
            className="list-item"
            onClick={() => unlocked && onSelectStage(stage.id)}
            style={{
              opacity: unlocked ? 1 : 0.45,
              cursor: unlocked ? 'pointer' : 'default',
              borderColor: isSelected ? 'var(--gold)' : undefined,
            }}
          >
            <div>
              <div className="list-item-title">
                {completed ? '\u2705' : unlocked ? '\ud83d\udd13' : '\ud83d\udd12'} Stage {stage.order} {'\u00b7'} {stage.title}
              </div>
              <div className="list-item-sub">
                {stage.description}
                {unlocked && !completed && stage.rounds.length > 1
                  ? ` \u00b7 Round ${roundIndex + 1} of ${stage.rounds.length}`
                  : ''}
                {completed ? ' \u00b7 Completed' : ''}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
