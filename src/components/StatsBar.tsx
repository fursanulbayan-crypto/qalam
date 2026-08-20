'use client';

export default function StatsBar({
  wpm,
  accuracy,
  errors,
  time,
  lives,
  score,
  best,
  bestLabel,
  showTime,
  showRaceStats,
}: {
  wpm: number;
  accuracy: number;
  errors: number;
  time?: string;
  lives?: number;
  score?: number;
  best?: number | null;
  bestLabel?: string;
  showTime: boolean;
  showRaceStats: boolean;
}) {
  return (
    <div className="stats">
      <div>
        <div className="stat-label">WPM</div>
        <div className="stat-value">{wpm}</div>
      </div>
      <div>
        <div className="stat-label">Accuracy</div>
        <div className="stat-value">{accuracy}%</div>
      </div>
      <div>
        <div className="stat-label">Errors</div>
        <div className="stat-value">{errors}</div>
      </div>
      {showTime && (
        <div>
          <div className="stat-label">Time</div>
          <div className="stat-value">{time}</div>
        </div>
      )}
      {showRaceStats && (
        <>
          <div>
            <div className="stat-label">Lives</div>
            <div className="stat-value">{lives}</div>
          </div>
          <div>
            <div className="stat-label">Score</div>
            <div className="stat-value">{score}</div>
          </div>
        </>
      )}
      {best !== undefined && best !== null && (
        <div>
          <div className="stat-label">{bestLabel || 'Best'}</div>
          <div className="stat-value">{best}</div>
        </div>
      )}
    </div>
  );
}
