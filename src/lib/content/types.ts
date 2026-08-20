export type Language = 'en' | 'ar';
export type Mode = 'scribe' | 'race' | 'harakat';
export type Level = 'beginner' | 'intermediate' | 'pro';
export type ContentSource = 'local' | 'quran' | 'hadith';
export type Direction = 'ltr' | 'rtl';

// The typing engine (Scribe/Race) only ever sees this shape.
// It never knows whether the text came from the local bank, Al Quran Cloud, or Hadith API.
export interface QalamContent {
  id: string;
  source: ContentSource;
  language: Language;
  mode: Mode;
  level?: Level;
  title?: string;
  /** Always the authentic, unmodified text — this is what Authentic Sources displays. */
  text: string;
  /**
   * Keyboard-compatible version of `text`, used only when feeding the typing
   * engine (Scribe/Race). Populated for Qur'an content, where the authentic
   * Uthmani script contains marks the Arabic 101 keyboard has no key for
   * (e.g. alef wasla, dagger alef, recitation/waqf marks). Undefined for
   * content that's already keyboard-safe as-is (local bank passages, etc.),
   * in which case callers should fall back to `text`.
   */
  typingText?: string;
  reference?: string;
  collection?: string;
  category?: string;
  direction: Direction;
  wordCount?: number;
  difficulty?: number;
}

export interface QalamRaceWord {
  id: string;
  language: Language;
  word: string;
  level?: Level;
  category?: string;
  difficulty?: number;
  source: ContentSource;
}

export interface HarakatStage {
  id: string;
  name: string;
  difficulty: number;
  items: string[];
}

export interface ProviderResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface SurahSummary {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

export interface HadithCollectionSummary {
  slug: string;
  name: string;
}
