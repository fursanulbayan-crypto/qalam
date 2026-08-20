'use client';

import { useState } from 'react';
import { EN_ROWS, AR_KEY_ROWS, locateArabicChar } from '@/lib/content/keyboardLayouts';
import { Language } from '@/lib/content/types';

export default function Keyboard({ language, nextChar }: { language: Language; nextChar: string | null }) {
  const [visible, setVisible] = useState(true);
  const [studyLayer, setStudyLayer] = useState<'base' | 'shift'>('base');

  return (
    <div>
      <div className="kb-toggle-row">
        <span>Classic keyboard reference</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {language === 'ar' && visible && (
            <div className="toggle-group" style={{ transform: 'scale(0.85)', transformOrigin: 'right center' }}>
              <button className={studyLayer === 'base' ? 'active' : ''} onClick={() => setStudyLayer('base')}>
                Base
              </button>
              <button className={studyLayer === 'shift' ? 'active' : ''} onClick={() => setStudyLayer('shift')}>
                Shift
              </button>
            </div>
          )}
          <button onClick={() => setVisible((v) => !v)}>{visible ? 'hide' : 'show'}</button>
        </div>
      </div>

      {visible && language === 'en' && <EnglishBoard nextChar={nextChar} />}
      {visible && language === 'ar' && <ArabicBoard nextChar={nextChar} studyLayer={studyLayer} />}
    </div>
  );
}

function EnglishBoard({ nextChar }: { nextChar: string | null }) {
  return (
    <div className="keyboard">
      {EN_ROWS.map((row, i) => (
        <div
          className="kb-row"
          key={i}
          style={{
            gridTemplateColumns: `repeat(${row.length}, 1fr)`,
            maxWidth: `${row.length * 38 + (row.length - 1) * 6}px`,
          }}
        >
          {row.map((ch) => (
            <div key={ch} className={`kb-key${ch === nextChar ? ' next' : ''}`}>
              {ch}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ArabicBoard({ nextChar, studyLayer }: { nextChar: string | null; studyLayer: 'base' | 'shift' }) {
  // The typing engine always determines the correct layer from the actual
  // next character, regardless of what the learner has toggled for study.
  const required = locateArabicChar(nextChar);
  const shiftRequired = required?.shift ?? false;

  return (
    <div className="keyboard">
      {AR_KEY_ROWS.map((row, i) => (
        <div
          className="kb-row"
          key={i}
          style={{
            gridTemplateColumns: `repeat(${row.length}, 1fr)`,
            maxWidth: `${row.length * 38 + (row.length - 1) * 6}px`,
          }}
        >
          {row.map((k) => {
            const isNext = required !== null && required.key === k.key;
            const primary = studyLayer === 'shift' ? k.shift : k.base;
            const secondary = studyLayer === 'shift' ? k.base : k.shift;
            return (
              <div key={k.key} className={`kb-key lang-ar${isNext ? ' next' : ''}`} title={`${k.base}  /  ${k.shift}`}>
                <div className="kb-key-primary">{primary}</div>
                <div className="kb-key-secondary">{secondary}</div>
              </div>
            );
          })}
        </div>
      ))}
      <div className="kb-row kb-shift-row">
        <div className={`kb-key kb-shift-key${shiftRequired ? ' next' : ''}`}>Shift</div>
        {shiftRequired && <div className="hint" style={{ margin: 0 }}>Hold Shift for the next character</div>}
      </div>
    </div>
  );
}
