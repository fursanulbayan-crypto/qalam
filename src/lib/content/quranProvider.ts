import { QalamContent, SurahSummary } from './types';
import { toTypingTarget } from './textUtils';

const BASE = 'https://api.alquran.cloud/v1';
// quran-uthmani carries the authentic Uthmani script, including its own vocalisation.
// We display it exactly as returned — Qalam never edits Qur'anic text. The
// keyboard-compatible typingText (see textUtils.toTypingTarget) is derived
// alongside it for the typing engine only; `text` itself is never altered.
const EDITION = 'quran-uthmani';

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Al Quran Cloud request failed with status ${res.status}`);
  }
  const json = await res.json();
  if (json.code !== 200) {
    throw new Error('Al Quran Cloud returned an unexpected response');
  }
  return json.data;
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export async function getSurahList(): Promise<SurahSummary[]> {
  const data = await fetchJson(`${BASE}/surah`);
  return data.map((s: any) => ({
    number: s.number,
    name: s.name,
    englishName: s.englishName,
    numberOfAyahs: s.numberOfAyahs,
  }));
}

export async function getSurah(number: number): Promise<QalamContent> {
  const data = await fetchJson(`${BASE}/surah/${number}/${EDITION}`);
  const text = data.ayahs.map((a: any) => a.text).join(' ');
  return {
    id: `quran-surah-${number}`,
    source: 'quran',
    language: 'ar',
    mode: 'scribe',
    title: data.englishName,
    text,
    typingText: toTypingTarget(text),
    reference: `${data.englishName} \u00b7 Surah ${number}`,
    category: 'Qur\u2019an',
    direction: 'rtl',
    wordCount: wordCount(text),
  };
}

export async function getAyah(surah: number, ayah: number): Promise<QalamContent> {
  const data = await fetchJson(`${BASE}/ayah/${surah}:${ayah}/${EDITION}`);
  return {
    id: `quran-${surah}-${ayah}`,
    source: 'quran',
    language: 'ar',
    mode: 'scribe',
    title: data.surah.englishName,
    text: data.text,
    typingText: toTypingTarget(data.text),
    reference: `${data.surah.englishName} \u00b7 ${surah}:${ayah}`,
    category: 'Qur\u2019an',
    direction: 'rtl',
    wordCount: wordCount(data.text),
  };
}

export async function getJuz(number: number): Promise<QalamContent[]> {
  const data = await fetchJson(`${BASE}/juz/${number}/${EDITION}`);
  return data.ayahs.map((a: any) => ({
    id: `quran-juz${number}-${a.surah.number}-${a.numberInSurah}`,
    source: 'quran',
    language: 'ar',
    mode: 'scribe',
    title: a.surah.englishName,
    text: a.text,
    typingText: toTypingTarget(a.text),
    reference: `${a.surah.englishName} \u00b7 ${a.surah.number}:${a.numberInSurah}`,
    category: 'Qur\u2019an',
    direction: 'rtl',
    wordCount: wordCount(a.text),
  }));
}

export async function searchQuran(query: string): Promise<QalamContent[]> {
  const data = await fetchJson(`${BASE}/search/${encodeURIComponent(query)}/all/${EDITION}`);
  const matches = data.matches ?? [];
  return matches.map((m: any) => ({
    id: `quran-search-${m.surah.number}-${m.numberInSurah}`,
    source: 'quran',
    language: 'ar',
    mode: 'scribe',
    title: m.surah.englishName,
    text: m.text,
    typingText: toTypingTarget(m.text),
    reference: `${m.surah.englishName} \u00b7 ${m.surah.number}:${m.numberInSurah}`,
    category: 'Qur\u2019an',
    direction: 'rtl',
    wordCount: wordCount(m.text),
  }));
}

export async function getRandomAyah(): Promise<QalamContent> {
  const surahList = await getSurahList();
  const surah = surahList[Math.floor(Math.random() * surahList.length)];
  const ayahNumber = 1 + Math.floor(Math.random() * surah.numberOfAyahs);
  return getAyah(surah.number, ayahNumber);
}
