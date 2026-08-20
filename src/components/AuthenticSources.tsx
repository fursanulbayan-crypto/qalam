'use client';

import { useEffect, useState } from 'react';
import { QalamContent, SurahSummary, HadithCollectionSummary } from '@/lib/content/types';
import {
  fetchSurahList,
  fetchSurah,
  fetchAyah,
  fetchRandomAyah,
  searchQuranSource,
  fetchHadithCollections,
  fetchHadithsByCollection,
  fetchRandomHadith,
  searchHadithSource,
} from '@/lib/content/contentManager';
import { safeArabicWordSplit } from '@/lib/content/textUtils';
import SourceCard from './SourceCard';

// Hadith is temporarily disabled in the UI while the hadithapi.com
// integration is being sorted out. Nothing else was removed — the
// HadithProvider, /api/hadith route, and HadithPanel below are untouched.
// Flip this back to true (and re-add the toggle button) to bring it back.
const HADITH_ENABLED = false;

export default function AuthenticSources({
  onTypeThis,
  onRaceWithWords,
}: {
  onTypeThis: (content: QalamContent) => void;
  onRaceWithWords: (words: string[]) => void;
}) {
  const [source, setSource] = useState<'quran' | 'hadith'>('quran');
  const activeSource = HADITH_ENABLED ? source : 'quran';

  return (
    <div>
      {HADITH_ENABLED && (
        <div className="controls-row">
          <div className="toggle-group">
            <button className={activeSource === 'quran' ? 'active' : ''} onClick={() => setSource('quran')}>
              {'\ud83d\udcd6'} Qur&#8217;an
            </button>
            <button className={activeSource === 'hadith' ? 'active' : ''} onClick={() => setSource('hadith')}>
              {'\ud83d\udcdc'} Hadith
            </button>
          </div>
        </div>
      )}
      <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: HADITH_ENABLED ? -10 : 0, marginBottom: 20 }}>
        {activeSource === 'quran' ? 'Practice authentic Qur\u2019anic text.' : 'Practise authentic Hadith text.'}
      </p>
      {activeSource === 'quran' ? (
        <QuranPanel onTypeThis={onTypeThis} onRaceWithWords={onRaceWithWords} />
      ) : (
        <HadithPanel onTypeThis={onTypeThis} onRaceWithWords={onRaceWithWords} />
      )}
    </div>
  );
}

function ResultActions({
  content,
  onTypeThis,
  onRaceWithWords,
}: {
  content: QalamContent;
  onTypeThis: (c: QalamContent) => void;
  onRaceWithWords: (w: string[]) => void;
}) {
  // typingText (when present) is the keyboard-compatible version of this
  // passage — used only here, never for the authentic display above these
  // buttons. Content without a typingText (nothing currently, since only
  // Qur'an content sets it) falls back to the authentic text unchanged.
  const typingText = content.typingText ?? content.text;
  const contentForTyping: QalamContent = typingText === content.text ? content : { ...content, text: typingText };

  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 10, marginBottom: 20 }}>
      <button className="primary-btn" onClick={() => onTypeThis(contentForTyping)}>
        Type this
      </button>
      <button className="secondary-btn" onClick={() => onRaceWithWords(safeArabicWordSplit(typingText))}>
        Race with these words
      </button>
    </div>
  );
}

function QuranPanel({
  onTypeThis,
  onRaceWithWords,
}: {
  onTypeThis: (c: QalamContent) => void;
  onRaceWithWords: (w: string[]) => void;
}) {
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [ayahNumber, setAyahNumber] = useState<number>(1);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QalamContent | null>(null);
  const [searchResults, setSearchResults] = useState<QalamContent[]>([]);
  const [message, setMessage] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSurahList().then((r) => {
      if (r.data) setSurahs(r.data);
      if (r.usedFallback) setMessage(r.message);
    });
  }, []);

  async function loadAyah() {
    setLoading(true);
    setSearchResults([]);
    const r = await fetchAyah(selectedSurah, ayahNumber);
    setResult(r.data);
    setMessage(r.usedFallback ? r.message : undefined);
    setLoading(false);
  }

  async function loadRandom() {
    setLoading(true);
    setSearchResults([]);
    const r = await fetchRandomAyah();
    setResult(r.data);
    setMessage(r.usedFallback ? r.message : undefined);
    setLoading(false);
  }

  async function runSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    const r = await searchQuranSource(query.trim());
    setSearchResults(r.data ?? []);
    setMessage(r.usedFallback ? r.message : undefined);
    setLoading(false);
  }

  return (
    <div>
      {message && <div className="fallback-banner">{message}</div>}

      <div className="form-row">
        <select value={selectedSurah} onChange={(e) => setSelectedSurah(Number(e.target.value))}>
          {surahs.length ? (
            surahs.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.englishName}
              </option>
            ))
          ) : (
            <option>Loading surahs...</option>
          )}
        </select>
        <input
          type="number"
          min={1}
          value={ayahNumber}
          onChange={(e) => setAyahNumber(Number(e.target.value))}
          style={{ width: 80 }}
          aria-label="Ayah number"
        />
        <button className="secondary-btn" onClick={loadAyah} disabled={loading}>
          Load ayah
        </button>
        <button className="secondary-btn" onClick={loadRandom} disabled={loading}>
          Random ayah
        </button>
      </div>

      <div className="form-row">
        <input
          type="search"
          placeholder="Search the Qur'an..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <button className="secondary-btn" onClick={runSearch} disabled={loading}>
          Search
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="surah-list">
          {searchResults.map((r) => (
            <div className="list-item" key={r.id} onClick={() => { setResult(r); setSearchResults([]); }}>
              <div>
                <div className="list-item-title">{r.reference}</div>
                <div className="list-item-sub">{r.text.slice(0, 60)}...</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {result && (
        <div>
          <SourceCard content={result} />
          <div className={`passage lang-ar`} style={{ fontSize: 24 }}>
            {result.text}
          </div>
          <ResultActions content={result} onTypeThis={onTypeThis} onRaceWithWords={onRaceWithWords} />
        </div>
      )}
    </div>
  );
}

function HadithPanel({
  onTypeThis,
  onRaceWithWords,
}: {
  onTypeThis: (c: QalamContent) => void;
  onRaceWithWords: (w: string[]) => void;
}) {
  const [collections, setCollections] = useState<HadithCollectionSummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QalamContent | null>(null);
  const [listResults, setListResults] = useState<QalamContent[]>([]);
  const [message, setMessage] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHadithCollections().then((r) => {
      if (r.data) {
        setCollections(r.data);
        if (r.data[0]) setSelectedSlug(r.data[0].slug);
      }
      if (r.usedFallback) setMessage(r.message);
    });
  }, []);

  async function browse() {
    if (!selectedSlug) return;
    setLoading(true);
    setResult(null);
    const r = await fetchHadithsByCollection(selectedSlug, 1);
    setListResults(r.data ?? []);
    setMessage(r.usedFallback ? r.message : undefined);
    setLoading(false);
  }

  async function loadRandom() {
    setLoading(true);
    setListResults([]);
    const r = await fetchRandomHadith(selectedSlug || undefined);
    setResult(r.data);
    setMessage(r.usedFallback ? r.message : undefined);
    setLoading(false);
  }

  async function runSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    const r = await searchHadithSource(query.trim());
    setListResults(r.data ?? []);
    setMessage(r.usedFallback ? r.message : undefined);
    setLoading(false);
  }

  return (
    <div>
      {message && <div className="fallback-banner">{message}</div>}

      <div className="form-row">
        <select value={selectedSlug} onChange={(e) => setSelectedSlug(e.target.value)}>
          {collections.length ? (
            collections.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))
          ) : (
            <option>Loading collections...</option>
          )}
        </select>
        <button className="secondary-btn" onClick={browse} disabled={loading}>
          Browse collection
        </button>
        <button className="secondary-btn" onClick={loadRandom} disabled={loading}>
          Random hadith
        </button>
      </div>

      <div className="form-row">
        <input
          type="search"
          placeholder="Search hadith text..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <button className="secondary-btn" onClick={runSearch} disabled={loading}>
          Search
        </button>
      </div>

      {listResults.length > 0 && (
        <div className="hadith-list">
          {listResults.map((r) => (
            <div className="list-item" key={r.id} onClick={() => { setResult(r); setListResults([]); }}>
              <div>
                <div className="list-item-title">{r.reference}</div>
                <div className="list-item-sub">{r.text.slice(0, 60)}...</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {result && (
        <div>
          <SourceCard content={result} />
          <div className={`passage lang-ar`} style={{ fontSize: 24 }}>
            {result.text}
          </div>
          <ResultActions content={result} onTypeThis={onTypeThis} onRaceWithWords={onRaceWithWords} />
        </div>
      )}
    </div>
  );
}
