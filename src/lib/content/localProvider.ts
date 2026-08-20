import bank from './qalam_master_content_bank_v1.json';
import { QalamContent, QalamRaceWord, Language, Level, HarakatStage } from './types';

interface RawRaceWord {
  id: string;
  language: Language;
  mode: string;
  level: Level;
  category: string;
  word: string;
  difficulty: number;
}

interface RawPassage {
  id: string;
  language: Language;
  mode: string;
  level: Level;
  category: string;
  title: string;
  text: string;
  wordCount: number;
  difficulty: number;
}

interface RawBank {
  race_words: RawRaceWord[];
  scribe_passages: RawPassage[];
  harakat_challenge: { enabled: boolean; stages: HarakatStage[] };
}

const data = bank as unknown as RawBank;

function toDirection(language: Language) {
  return language === 'ar' ? 'rtl' : 'ltr';
}

export function getScribePassages(language: Language, level: Level): QalamContent[] {
  return data.scribe_passages
    .filter((p) => p.language === language && p.level === level)
    .map((p) => ({
      id: p.id,
      source: 'local',
      language: p.language,
      mode: 'scribe',
      level: p.level,
      title: p.title,
      text: p.text,
      category: p.category,
      direction: toDirection(p.language),
      wordCount: p.wordCount,
      difficulty: p.difficulty,
    }));
}

export function getRandomScribePassage(language: Language, level: Level): QalamContent | null {
  const list = getScribePassages(language, level);
  if (!list.length) return null;
  return list[Math.floor(Math.random() * list.length)];
}

export function getRaceWords(language: Language, level: Level): QalamRaceWord[] {
  return data.race_words
    .filter((w) => w.language === language && w.level === level)
    .map((w) => ({
      id: w.id,
      language: w.language,
      word: w.word,
      level: w.level,
      category: w.category,
      difficulty: w.difficulty,
      source: 'local',
    }));
}

export function getHarakatStages(): HarakatStage[] {
  return data.harakat_challenge.enabled ? data.harakat_challenge.stages : [];
}
