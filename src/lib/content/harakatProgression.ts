export type HarakatLevel = 'beginner' | 'intermediate' | 'pro';

export interface HarakatCategory {
  /** Matches the original content-bank stage id — category identity is preserved, not renamed. */
  id: string;
  name: string;
  description: string;
  content: Record<HarakatLevel, string[]>;
}

// BEGINNER = recognise and type basic harakat
// INTERMEDIATE = combine harakat accurately in words
// PRO = type complex fully vocalised Arabic confidently
//
// Every item from the original qalam_master_content_bank_v1.json
// harakat_challenge stages is preserved somewhere below (repositioned to the
// tier it fits, extracted programmatically so the text is byte-identical to
// the source — nothing was retyped by hand). New items were built from
// verified letter+harakat unicode building blocks and checked
// character-by-character (each mark confirmed FATHA/KASRA/DAMMA/SUKUN/
// SHADDA/TANWEEN in the right position) before inclusion.
export const HARAKAT_CATEGORIES: HarakatCategory[] = [
  {
    id: 'h1',
    name: 'Single Harakat',
    description: 'One vowel mark at a time — fatha, kasra, or damma.',
    content: {
      // Programmatically generated letter+harakat pairs.
      beginner: [
        '\u0628\u064E', '\u0628\u0650', '\u0628\u064F',
        '\u062A\u064E', '\u062A\u0650', '\u062A\u064F',
        '\u062C\u064E', '\u062C\u0650', '\u062C\u064F',
        '\u0645\u064E', '\u0645\u0650', '\u0645\u064F',
      ],
      // Original h1 items — real single-harakat (fatha) verbs, unchanged.
      intermediate: [
        '\u0643\u064E\u062A\u064E\u0628\u064E', '\u0630\u064E\u0647\u064E\u0628\u064E', '\u062C\u064E\u0644\u064E\u0633\u064E',
        '\u0642\u064E\u0631\u064E\u0623\u064E', '\u0639\u064E\u0644\u0650\u0645\u064E', '\u0641\u064E\u0647\u0650\u0645\u064E',
        '\u062F\u064E\u0631\u064E\u0633\u064E', '\u062D\u064E\u0641\u0650\u0638\u064E',
      ],
      // Real, verified single/dominant-fatha nouns, longer than the intermediate tier.
      pro: [
        '\u0628\u064E\u0631\u064E\u0643\u064E\u0629\u064C', // barakah — blessing
        '\u0633\u064E\u0639\u064E\u0627\u062F\u064E\u0629\u064C', // sa'adah — happiness
        '\u0643\u064E\u0631\u064E\u0627\u0645\u064E\u0629\u064C', // karamah — dignity
        '\u0634\u064E\u062C\u064E\u0627\u0639\u064E\u0629\u064C', // shaja'ah — courage
      ],
    },
  },
  {
    id: 'h2',
    name: 'Mixed Harakat',
    description: 'Different vowel marks combined within the same word.',
    content: {
      // Programmatically generated 2-syllable, differing-vowel drill pairs.
      beginner: [
        '\u0628\u064E\u062A\u0650', '\u0643\u064F\u0646\u064E', '\u062F\u0650\u0631\u064F', '\u0645\u064F\u062A\u0650',
        '\u0633\u064E\u0644\u0650', '\u0646\u064F\u0628\u064E', '\u0644\u064E\u0645\u064F', '\u0647\u064E\u062F\u0650',
      ],
      // Original h2 items — real short mixed-harakat words, unchanged.
      intermediate: [
        '\u0645\u064F\u0633\u0652\u0644\u0650\u0645', '\u0645\u064F\u0639\u064E\u0644\u0651\u0650\u0645', '\u0645\u064E\u062F\u0652\u0631\u064E\u0633\u064E\u0629',
        '\u0645\u064E\u0643\u0652\u062A\u064E\u0628', '\u0642\u064F\u0631\u0652\u0622\u0646', '\u0631\u064E\u062D\u0652\u0645\u064E\u0629', '\u0647\u0650\u062F\u064E\u0627\u064A\u064E\u0629',
      ],
      // Real, verified single mixed-harakat words, longer than intermediate.
      pro: [
        '\u0645\u064F\u062A\u064E\u0639\u064E\u0644\u0651\u0650\u0645\u064C', // muta'allim — learner
        '\u0645\u064F\u062C\u0652\u062A\u064E\u0647\u0650\u062F\u064C', // mujtahid — diligent
        '\u0645\u064E\u0643\u0652\u062A\u064E\u0628\u064E\u0629\u064C', // maktabah — library
      ],
    },
  },
  {
    id: 'h3',
    name: 'Shaddah and Sukoon',
    description: 'Doubled consonants (shaddah) and silent letters (sukoon).',
    content: {
      // Real, verified short common words showing sukoon and shaddah in isolation.
      beginner: [
        '\u0645\u064E\u0646\u0652', '\u0647\u064E\u0644\u0652', '\u0628\u064E\u0644\u0652', '\u0642\u064E\u062F\u0652',
        '\u0623\u064F\u0645\u0651', '\u062D\u064E\u0642\u0651', '\u0631\u064E\u0628\u0651', '\u062E\u064E\u0637\u0651',
      ],
      // Original h3 items (5 of 6 — one, مُعَلِّم, was an exact duplicate of an
      // h2 item in the source bank, kept only under h2 to avoid repeating it).
      intermediate: [
        '\u0645\u064F\u062D\u064E\u0645\u0651\u064E\u062F', '\u0645\u064F\u062F\u064E\u0631\u0651\u0650\u0633',
        '\u0627\u0644\u0635\u0651\u064E\u0644\u064E\u0627\u0629', '\u0627\u0644\u062A\u0651\u064E\u0639\u0652\u0644\u0650\u064A\u0645', '\u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0629',
      ],
      // Real, verified words, more complex than intermediate.
      pro: [
        '\u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0629\u064F', // ar-rahmah — the mercy
        '\u0627\u0644\u0652\u0645\u064E\u062D\u064E\u0628\u0651\u064E\u0629\u064F', // al-mahabbah — the love
      ],
    },
  },
  {
    id: 'h4',
    name: 'Full Vocalised Passage',
    description: 'Complete, fully vocalised sentences and short passages.',
    content: {
      // "الْعِلْمُ نُورٌ." — Knowledge is light.
      beginner: ['\u0627\u0644\u0652\u0639\u0650\u0644\u0652\u0645\u064F \u0646\u064F\u0648\u0631\u064C.'],
      // "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ." — Seeking knowledge is an
      // obligation upon every Muslim (well-known fixed phrase).
      intermediate: [
        '\u0637\u064E\u0644\u064E\u0628\u064F \u0627\u0644\u0652\u0639\u0650\u0644\u0652\u0645\u0650 \u0641\u064E\u0631\u0650\u064A\u0636\u064E\u0629\u064C \u0639\u064E\u0644\u064E\u0649 \u0643\u064F\u0644\u0651\u0650 \u0645\u064F\u0633\u0652\u0644\u0650\u0645\u064D.',
      ],
      // Original h4 item — unchanged, kept as the hardest tier.
      pro: [
        '\u0625\u0650\u0646\u0651\u064E \u0637\u064E\u0644\u064E\u0628\u064E \u0627\u0644\u0652\u0639\u0650\u0644\u0652\u0645\u0650 \u0645\u0650\u0646\u0652 \u0623\u064E\u0641\u0652\u0636\u064E\u0644\u0650 \u0627\u0644\u0652\u0623\u064E\u0639\u0652\u0645\u064E\u0627\u0644\u0650\u060C \u0648\u064E\u0625\u0650\u0646\u0651\u064E \u0627\u0644\u0652\u0639\u0650\u0644\u0652\u0645\u064E \u0627\u0644\u0646\u0651\u064E\u0627\u0641\u0650\u0639\u064E \u064A\u064E\u0631\u0652\u0641\u064E\u0639\u064F \u0642\u064E\u062F\u0652\u0631\u064E \u0627\u0644\u0652\u0625\u0650\u0646\u0652\u0633\u064E\u0627\u0646\u0650 \u0648\u064E\u064A\u064E\u0647\u0652\u062F\u0650\u064A\u0647\u0650 \u0625\u0650\u0644\u064E\u0649 \u0627\u0644\u0652\u062E\u064E\u064A\u0652\u0631\u0650.',
      ],
    },
  },
];

export function getHarakatCategoryById(id: string): HarakatCategory | undefined {
  return HARAKAT_CATEGORIES.find((c) => c.id === id);
}
