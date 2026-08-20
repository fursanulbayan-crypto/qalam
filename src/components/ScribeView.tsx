'use client';

import { useEffect, useRef } from 'react';
import { QalamContent } from '@/lib/content/types';
import { useScribeEngine } from '@/hooks/useScribeEngine';
import { usePersistedBest } from '@/hooks/usePersistedBest';
import StatsBar from './StatsBar';
import Keyboard from './Keyboard';
import SourceCard from './SourceCard';

export default function ScribeView({
  content,
  onNext,
  fallbackMessage,
  statsId,
}: {
  content: QalamContent | null;
  onNext: () => void;
  fallbackMessage?: string;
  /** Identifies this selection for best-WPM persistence, e.g. "ar-beginner". Omit to skip tracking. */
  statsId?: string;
}) {
  const engine = useScribeEngine(content);
  const inputRef = useRef<HTMLInputElement>(null);
  const { best, record } = usePersistedBest('scribe-wpm', statsId || content?.source || 'adhoc');

  useEffect(() => {
    inputRef.current?.focus();
  }, [content?.id]);

  useEffect(() => {
    if (engine.done) record(engine.wpm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.done]);

  if (!content) {
    return (
      <div className="stage">
        <div className="center-panel">
          <h2>No passage loaded</h2>
          <p>Choose a level, or pick something from Authentic Sources, to start typing.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <StatsBar
        wpm={engine.wpm}
        accuracy={engine.accuracy}
        errors={engine.errors}
        time={engine.elapsedLabel}
        best={engine.done ? best : undefined}
        bestLabel="Best WPM"
        showTime
        showRaceStats={false}
      />

      <div className="stage">
        {fallbackMessage && <div className="fallback-banner">{fallbackMessage}</div>}
        <SourceCard content={content} />
        {content.title && content.source === 'local' && (
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>{content.title}</div>
        )}

        {!engine.done ? (
          <>
            <div className={`passage lang-${content.language}`}>
              {content.text.split('').map((char, i) => {
                let cls = 'ch-pending';
                if (i < engine.typed.length) {
                  cls = engine.typed[i] === char ? 'ch-correct' : 'ch-wrong';
                } else if (i === engine.typed.length) {
                  cls = 'ch-current';
                }
                return (
                  <span className={cls} key={i}>
                    {char}
                  </span>
                );
              })}
            </div>
            <div className="hint">Type the passage above. Your timer starts on the first keystroke.</div>
          </>
        ) : (
          <div className="center-panel">
            <h2>Passage complete</h2>
            <p>
              {engine.wpm} words per minute, {engine.accuracy}% accuracy, {engine.errors} errors, {engine.elapsedLabel}{' '}
              elapsed.
              {best !== null && engine.wpm >= best ? ' New best!' : ''}
            </p>
            <button className="primary-btn" onClick={onNext}>
              New passage
            </button>
          </div>
        )}
      </div>

      {!engine.done && (
        <input
          ref={inputRef}
          type="text"
          className={`type-input lang-${content.language}`}
          value={engine.typed}
          onChange={(e) => engine.handleInput(e.target.value)}
          placeholder="Start typing here..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      )}

      <Keyboard language={content.language} nextChar={engine.done ? null : engine.nextChar} />
    </>
  );
}
