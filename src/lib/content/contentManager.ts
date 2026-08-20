import { QalamContent, SurahSummary, HadithCollectionSummary } from './types';

export interface SourceResult<T> {
  data: T | null;
  usedFallback: boolean;
  message?: string;
}

// Per the content-integrity rule: a failed authentic-source request must
// never be silently replaced with unrelated local content. It's fine for
// Practice mode's own local passages/words (handled entirely in
// localProvider.ts, never through this file) — but a Qur'an ayah or Hadith
// the learner specifically asked for either loads for real, or doesn't load
// at all with a plain explanation. No stand-in text.
const UNAVAILABLE_MESSAGE = 'Connect to the internet to explore authentic sources.';

async function callApi<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data as T;
}

function unavailable<T>(): SourceResult<T> {
  return { data: null, usedFallback: true, message: UNAVAILABLE_MESSAGE };
}

// --- Qur'an -----------------------------------------------------------

export async function fetchSurahList(): Promise<SourceResult<SurahSummary[]>> {
  try {
    const data = await callApi<SurahSummary[]>('/api/quran?action=surahList');
    return { data, usedFallback: false };
  } catch {
    return unavailable();
  }
}

export async function fetchAyah(surah: number, ayah: number): Promise<SourceResult<QalamContent>> {
  try {
    const data = await callApi<QalamContent>(`/api/quran?action=ayah&surah=${surah}&ayah=${ayah}`);
    return { data, usedFallback: false };
  } catch {
    return unavailable();
  }
}

export async function fetchSurah(number: number): Promise<SourceResult<QalamContent>> {
  try {
    const data = await callApi<QalamContent>(`/api/quran?action=surah&number=${number}`);
    return { data, usedFallback: false };
  } catch {
    return unavailable();
  }
}

export async function fetchRandomAyah(): Promise<SourceResult<QalamContent>> {
  try {
    const data = await callApi<QalamContent>('/api/quran?action=random');
    return { data, usedFallback: false };
  } catch {
    return unavailable();
  }
}

export async function searchQuranSource(query: string): Promise<SourceResult<QalamContent[]>> {
  try {
    const data = await callApi<QalamContent[]>(`/api/quran?action=search&q=${encodeURIComponent(query)}`);
    return { data, usedFallback: false };
  } catch {
    return unavailable();
  }
}

// --- Hadith -------------------------------------------------------------

export async function fetchHadithCollections(): Promise<SourceResult<HadithCollectionSummary[]>> {
  try {
    const data = await callApi<HadithCollectionSummary[]>('/api/hadith?action=collections');
    return { data, usedFallback: false };
  } catch {
    return unavailable();
  }
}

export async function fetchHadithsByCollection(
  slug: string,
  page = 1
): Promise<SourceResult<QalamContent[]>> {
  try {
    const data = await callApi<QalamContent[]>(`/api/hadith?action=byCollection&slug=${slug}&page=${page}`);
    return { data, usedFallback: false };
  } catch {
    return unavailable();
  }
}

export async function fetchRandomHadith(slug?: string): Promise<SourceResult<QalamContent>> {
  try {
    const url = slug ? `/api/hadith?action=random&slug=${slug}` : '/api/hadith?action=random';
    const data = await callApi<QalamContent>(url);
    return { data, usedFallback: false };
  } catch {
    return unavailable();
  }
}

export async function searchHadithSource(query: string): Promise<SourceResult<QalamContent[]>> {
  try {
    const data = await callApi<QalamContent[]>(`/api/hadith?action=search&q=${encodeURIComponent(query)}`);
    return { data, usedFallback: false };
  } catch {
    return unavailable();
  }
}
