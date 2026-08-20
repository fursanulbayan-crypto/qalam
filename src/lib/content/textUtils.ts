// Splits authentic Arabic text into words for Race mode without altering the
// letters or harakat themselves. Only whitespace and waqf/annotation marks are
// stripped — the Scribe view always shows the untouched source text.
export function safeArabicWordSplit(text: string): string[] {
  return text
    .replace(/[\u06D6-\u06ED]/g, '') // Qur'anic waqf / pause annotation marks
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}

// --- Qur'an typing target -------------------------------------------------
//
// The Arabic 101 keyboard (see keyboardLayouts.ts) supports the 29 base
// letters, the standard harakat (fatha/kasra/damma + tanween, sukun,
// shaddah), tatweel, and the hamza-carrying letter forms (أ إ آ ؤ ئ ء) — see
// ARABIC_CHAR_MAP. Authentic Uthmani Qur'an text also contains several
// classes of mark that have no key on this layout. Categorised below:
//
// (a) ALREADY SUPPORTED — left untouched: the 29 base letters, all harakat/
//     tanween/sukun/shaddah, tatweel, hamza forms, standard punctuation.
//
// (b) CONVERTED to an ordinary supported character:
//     - ALEF WASLA (ٱ, U+0671) -> plain ALEF (ا, U+0627). Same letter
//       (H key), different orthographic convention marking absence of a
//       glottal stop — a direct, unambiguous 1:1 substitution.
//
// (c) REMOVED for typing practice — no keyboard key, and no faithful
//     single-letter equivalent to substitute:
//     - Qur'anic annotation/waqf (pause) signs — Unicode ranges
//       U+0610-U+061A and U+06D6-U+06ED (small high/low marks, rub el hizb,
//       small waw/yeh recitation marks, etc.)
//     - Qur'an Extended-A annotation marks — U+08D4-U+08FF
//     - End-of-ayah marker (U+06DD) and any embedded Arabic-Indic digits
//       (verse numbers are metadata, not typing content)
//
// (d) SPECIAL CONSIDERATION (flagged — see chat for the full writeup):
//     - DAGGER ALEF / superscript alef (ٰ, U+0670): represents a long "aa"
//       vowel written as a small mark above the preceding consonant, with
//       no keyboard key and no clean 1:1 letter substitute (unlike wasla).
//       Two defensible options exist: drop it, or expand it into a full
//       alef letter (changing the text's length/structure). This
//       implementation DROPS it, treating it like the other recitation
//       marks in category (c), so the underlying consonant + harakat (which
//       ARE typeable) still carry the word. This is a judgment call, not a
//       verified-correct linguistic decision — flagged for review.

const QURANIC_ANNOTATION_RANGES: Array<[number, number]> = [
  [0x0610, 0x061a], // Arabic honorifics / Qur'anic annotation signs
  [0x06d6, 0x06dc], // small high waqf/pause marks
  [0x06de, 0x06e4], // small high marks, rub el hizb, small high marks
  [0x06e5, 0x06e6], // small waw / small yeh (recitation marks)
  [0x06e7, 0x06e8], // small high yeh, small high noon
  [0x06ea, 0x06ed], // empty centre / small low seen / small high marks
  [0x08d4, 0x08ff], // Arabic Extended-A Qur'anic annotation & small letters
];

const ALEF_WASLA = '\u0671';
const DAGGER_ALEF = '\u0670';
const END_OF_AYAH = '\u06dd';
const ARABIC_INDIC_DIGITS = /[\u0660-\u0669]/g;

function isQuranicAnnotation(codePoint: number): boolean {
  return QURANIC_ANNOTATION_RANGES.some(([start, end]) => codePoint >= start && codePoint <= end);
}

/**
 * Converts authentic Uthmani Qur'an text into a keyboard-compatible typing
 * target. Never mutates or is used for the authentic display — see the
 * QalamContent.typingText doc comment.
 */
export function toTypingTarget(text: string): string {
  let out = '';
  for (const ch of text) {
    if (ch === ALEF_WASLA) {
      out += '\u0627'; // (b) converted
      continue;
    }
    if (ch === DAGGER_ALEF || ch === END_OF_AYAH) {
      continue; // (d) dropped, and (c) dropped
    }
    const code = ch.codePointAt(0);
    if (code !== undefined && isQuranicAnnotation(code)) {
      continue; // (c) dropped
    }
    out += ch;
  }
  return out
    .replace(ARABIC_INDIC_DIGITS, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}
export function normalizeArabicForSearch(text: string): string {
  return text
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '') // strip harakat + tatweel for matching only
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627') // alif variants -> bare alif
    .replace(/\u0629/g, '\u0647') // ta marbuta -> ha (loose match)
    .replace(/\u0649/g, '\u064A') // alif maqsura -> ya
    .trim();
}
