'use client';

import { useEffect, useState } from 'react';
import { HARAKAT_CATEGORIES, HarakatLevel } from '@/lib/content/harakatProgression';
import { QalamContent } from '@/lib/content/types';
import ScribeView from './ScribeView';

const LEVEL_LABELS: Record<HarakatLevel, string> = {
  beginner: '\ud83c\udf31 Beginner',
  intermediate: '\ud83d\udcda Intermediate',
  pro: '\ud83d\udd25 Pro',
};

export default function HarakatView() {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [level, setLevel] = useState<HarakatLevel>('beginner');
  const [itemIndex, setItemIndex] = useState(0);
  const [content, setContent] = useState<QalamContent | null>(null);

  const category = HARAKAT_CATEGORIES[categoryIndex];

  useEffect(() => {
    if (!category) {
      setContent(null);
      return;
    }
    const items = category.content[level];
    const item = items[itemIndex % items.length];
    setContent({
      id: `harakat-${category.id}-${level}-${itemIndex}`,
      source: 'local',
      language: 'ar',
      mode: 'harakat',
      title: `${category.name} \u00b7 ${LEVEL_LABELS[level]}`,
      text: item,
      category: 'Harakat Challenge',
      direction: 'rtl',
    });
  }, [category, level, itemIndex]);

  if (!HARAKAT_CATEGORIES.length) {
    return (
      <div className="stage">
        <div className="center-panel">
          <h2>Harakat Challenge unavailable</h2>
          <p>No vocalised drills were found in the content bank.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="controls-row">
        <div className="toggle-group">
          {HARAKAT_CATEGORIES.map((c, i) => (
            <button
              key={c.id}
              className={i === categoryIndex ? 'active' : ''}
              onClick={() => {
                setCategoryIndex(i);
                setItemIndex(0);
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div className="controls-row">
        <div className="toggle-group">
          {(Object.keys(LEVEL_LABELS) as HarakatLevel[]).map((lvl) => (
            <button
              key={lvl}
              className={lvl === level ? 'active' : ''}
              onClick={() => {
                setLevel(lvl);
                setItemIndex(0);
              }}
            >
              {LEVEL_LABELS[lvl]}
            </button>
          ))}
        </div>
      </div>
      {category?.description && (
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: -8, marginBottom: 4 }}>{category.description}</p>
      )}
      <ScribeView
        content={content}
        onNext={() => setItemIndex((n) => n + 1)}
        statsId={category ? `harakat-${category.id}-${level}` : undefined}
      />
    </>
  );
}
