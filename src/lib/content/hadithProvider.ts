import { QalamContent, HadithCollectionSummary } from './types';

// Verified against the CURRENT docs at hadithapi.com/docs/{books,chapters,hadiths}
// on 2026-08-11 — these pages self-link to each other via /docs/... and show
// live-looking session tokens, confirming they're the canonical current docs.
// All three list the base as https://hadithapi.com/api/..., NOT /public/api/.
//
// Correction: the previous version of this file changed BASE to
// https://hadithapi.com/public/api after checking hadithapi.com/public/docs/*,
// which turned out to be a stale/legacy documentation snapshot still hosted
// at that path. That change was wrong and is almost certainly why Hadith
// requests started failing. Reverted here, with both doc paths now cross-checked.
const BASE = 'https://hadithapi.com/api';

// The six collections the spec asks us to surface. Slugs verified against the
// "Book slugs" table published at hadithapi.com/docs/hadiths (fetched
// 2026-08-11) — all six matched exactly, no changes needed here. The API also
// exposes mishkat, musnad-ahmad, and al-silsila-sahiha, which we deliberately
// don't surface per the "keep the initial UI focused" instruction.
export const KNOWN_COLLECTIONS: HadithCollectionSummary[] = [
  { slug: 'sahih-bukhari', name: 'Sahih al-Bukhari' },
  { slug: 'sahih-muslim', name: 'Sahih Muslim' },
  { slug: 'abu-dawood', name: 'Sunan Abi Dawud' },
  { slug: 'al-tirmidhi', name: 'Jami\u2019 al-Tirmidhi' },
  { slug: 'sunan-nasai', name: 'Sunan al-Nasa\u2019i' },
  { slug: 'ibn-e-majah', name: 'Sunan Ibn Majah' },
];

function requireKey(): string {
  const key = process.env.HADITH_API_KEY;
  if (!key) {
    throw new Error('HADITH_API_KEY is not configured');
  }
  return key;
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    // Log enough to diagnose (status + body), but redact the apiKey query
    // param before it ever hits the server console.
    const safeUrl = url.replace(/apiKey=[^&]+/, 'apiKey=***');
    const bodySnippet = await res.text().then((t) => t.slice(0, 400)).catch(() => '<unreadable body>');
    console.error(`Hadith API ${res.status} for ${safeUrl}\n${bodySnippet}`);
    throw new Error(`Hadith API request failed with status ${res.status}`);
  }
  return res.json();
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

// hadithapi.com's docs list request parameters but publish no sample response
// body, so the exact wrapper shape (Laravel-style paginated resource vs a
// bare array) is unverified. This tries the shapes that pattern of API
// commonly uses and logs what it actually saw if none match, so the first
// real request makes the mismatch obvious instead of silently returning [].
function extractList(json: any, key: string): any[] {
  if (Array.isArray(json?.[key]?.data)) return json[key].data;
  if (Array.isArray(json?.[key])) return json[key];
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json)) return json;
  console.warn(`Hadith API: unexpected "${key}" response shape`, JSON.stringify(json).slice(0, 300));
  return [];
}

function normalizeHadith(raw: any): QalamContent | null {
  // hadithArabic matches the documented query parameter name; falling back to
  // a snake_case variant in case the response field differs from the param name.
  const arabic: string = raw.hadithArabic || raw.hadith_arabic || '';
  if (!arabic.trim()) return null;
  const hadithNumber = raw.hadithNumber ?? raw.hadith_number ?? '?';
  const bookSlug = raw.book?.bookSlug ?? raw.bookSlug ?? 'unknown';
  const bookName = raw.book?.bookName ?? raw.bookName;
  return {
    id: `hadith-${bookSlug}-${hadithNumber}`,
    source: 'hadith',
    language: 'ar',
    mode: 'scribe',
    title: bookName,
    text: arabic,
    reference: `Hadith ${hadithNumber}`,
    collection: bookName,
    category: 'Hadith',
    direction: 'rtl',
    wordCount: wordCount(arabic),
  };
}

// Confirms which of our known collections the account/API actually exposes.
// Falls back to the static list if the books endpoint itself is unreachable —
// the chapter/hadith calls will still surface their own errors if a slug is wrong.
export async function getCollections(): Promise<HadithCollectionSummary[]> {
  const key = requireKey();
  try {
    const json = await fetchJson(`${BASE}/books?apiKey=${key}`);
    const books = extractList(json, 'books');
    const matched = KNOWN_COLLECTIONS.filter((c) => books.some((b: any) => b.bookSlug === c.slug));
    return matched.length ? matched : KNOWN_COLLECTIONS;
  } catch {
    return KNOWN_COLLECTIONS;
  }
}

export async function getHadithsByCollection(bookSlug: string, page = 1): Promise<QalamContent[]> {
  const key = requireKey();
  const json = await fetchJson(
    `${BASE}/hadiths?apiKey=${key}&book=${encodeURIComponent(bookSlug)}&paginate=25&page=${page}`
  );
  const items = extractList(json, 'hadiths');
  return items.map(normalizeHadith).filter((h): h is QalamContent => h !== null);
}

export async function searchHadith(query: string): Promise<QalamContent[]> {
  const key = requireKey();
  const json = await fetchJson(
    `${BASE}/hadiths?apiKey=${key}&hadithArabic=${encodeURIComponent(query)}&paginate=25`
  );
  const items = extractList(json, 'hadiths');
  return items.map(normalizeHadith).filter((h): h is QalamContent => h !== null);
}

export async function getRandomHadith(bookSlug?: string): Promise<QalamContent> {
  const slug = bookSlug || KNOWN_COLLECTIONS[Math.floor(Math.random() * KNOWN_COLLECTIONS.length)].slug;
  const page = 1 + Math.floor(Math.random() * 10);
  const items = await getHadithsByCollection(slug, page);
  if (!items.length) {
    throw new Error('No hadiths with Arabic text were returned for this collection/page');
  }
  return items[Math.floor(Math.random() * items.length)];
}
