'use client';

import { QalamContent } from '@/lib/content/types';

export default function SourceCard({ content }: { content: QalamContent }) {
  if (content.source === 'local') return null;
  const kind = content.source === 'quran' ? '\ud83d\udcd6 Qur\u2019an' : `\ud83d\udcdc ${content.collection || 'Hadith'}`;
  return (
    <div className="source-card">
      <div className="source-kind">{kind}</div>
      <div className="source-ref">{content.reference}</div>
    </div>
  );
}
