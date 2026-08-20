// English QWERTY reference — unchanged.
export const EN_ROWS: string[][] = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

export interface ArKey {
  /** Physical key label, matching its English QWERTY position. */
  key: string;
  /** Character produced with no modifier. */
  base: string;
  /** Character produced with Shift held. */
  shift: string;
}

// Windows Arabic (101) layout — KLID 00000401, KBDA1.DLL.
// Verified 2026-08-09 directly against Microsoft's published layout data
// (kbdlayout.info/KBDA1, sourced from KBDA1.DLL) and cross-checked against
// the harakat shift-key table in independent Arabic-typing references.
// Every base/shift pair below matches that source exactly. The previous
// version of this file used Arabic-Indic digits (١٢٣...) on the base number
// row, which is wrong — the real Arabic 101 layout keeps plain Latin digits
// on the base layer and only remaps the backtick key (ذ / shadda ّ).
export const AR_KEY_ROWS: ArKey[][] = [
  [
    { key: '`', base: '\u0630', shift: '\u0651' }, // ذ / ّ (shadda)
    { key: '1', base: '1', shift: '!' },
    { key: '2', base: '2', shift: '@' },
    { key: '3', base: '3', shift: '#' },
    { key: '4', base: '4', shift: '$' },
    { key: '5', base: '5', shift: '%' },
    { key: '6', base: '6', shift: '^' },
    { key: '7', base: '7', shift: '&' },
    { key: '8', base: '8', shift: '*' },
    { key: '9', base: '9', shift: ')' },
    { key: '0', base: '0', shift: '(' },
    { key: '-', base: '-', shift: '_' },
    { key: '=', base: '=', shift: '+' },
  ],
  [
    { key: 'q', base: '\u0636', shift: '\u064E' }, // ض / فتحة fatha
    { key: 'w', base: '\u0635', shift: '\u064B' }, // ص / فتحتان fathatan
    { key: 'e', base: '\u062B', shift: '\u064F' }, // ث / ضمة damma
    { key: 'r', base: '\u0642', shift: '\u064C' }, // ق / ضمتان dammatan
    { key: 't', base: '\u0641', shift: '\u0644\u0625' }, // ف / لإ
    { key: 'y', base: '\u063A', shift: '\u0625' }, // غ / إ
    { key: 'u', base: '\u0639', shift: '\u2018' }, // ع / ‘
    { key: 'i', base: '\u0647', shift: '\u00F7' }, // ه / ÷
    { key: 'o', base: '\u062E', shift: '\u00D7' }, // خ / ×
    { key: 'p', base: '\u062D', shift: '\u061B' }, // ح / ؛
    { key: '[', base: '\u062C', shift: '<' }, // ج / <
    { key: ']', base: '\u062F', shift: '>' }, // د / >
  ],
  [
    { key: 'a', base: '\u0634', shift: '\u0650' }, // ش / كسرة kasra
    { key: 's', base: '\u0633', shift: '\u064D' }, // س / كسرتان kasratan
    { key: 'd', base: '\u064A', shift: ']' }, // ي / ]
    { key: 'f', base: '\u0628', shift: '[' }, // ب / [
    { key: 'g', base: '\u0644', shift: '\u0644\u0623' }, // ل / لأ
    { key: 'h', base: '\u0627', shift: '\u0623' }, // ا / أ
    { key: 'j', base: '\u062A', shift: '\u0640' }, // ت / ـ tatweel
    { key: 'k', base: '\u0646', shift: '\u060C' }, // ن / ، (Arabic comma)
    { key: 'l', base: '\u0645', shift: '/' }, // م / /
    { key: ';', base: '\u0643', shift: ':' }, // ك / :
    { key: "'", base: '\u0637', shift: '\u201C' }, // ط / “
  ],
  [
    { key: 'z', base: '\u0626', shift: '~' }, // ئ / ~
    { key: 'x', base: '\u0621', shift: '\u0652' }, // ء / سكون sukun
    { key: 'c', base: '\u0624', shift: '}' }, // ؤ / }
    { key: 'v', base: '\u0631', shift: '{' }, // ر / {
    { key: 'b', base: '\u0644\u0627', shift: '\u0644\u0622' }, // لا / لآ
    { key: 'n', base: '\u0649', shift: '\u0622' }, // ى / آ
    { key: 'm', base: '\u0629', shift: '\u2019' }, // ة / ’
    { key: ',', base: '\u0648', shift: ',' }, // و / ,
    { key: '.', base: '\u0632', shift: '.' }, // ز / .
    { key: '/', base: '\u0638', shift: '\u061F' }, // ظ / ؟
  ],
];

// Kept for anything still referencing the old base-only shape.
export const AR_ROWS: string[][] = AR_KEY_ROWS.map((row) => row.map((k) => k.base));

export interface ArKeyLocation {
  key: string;
  shift: boolean;
}

// Character -> physical key + modifier. Base entries are added first so
// that if a base and shift character ever collided (none do here) the
// base position would win.
function buildArabicCharMap(): Record<string, ArKeyLocation> {
  const map: Record<string, ArKeyLocation> = {};
  for (const row of AR_KEY_ROWS) {
    for (const k of row) {
      if (!(k.base in map)) map[k.base] = { key: k.key, shift: false };
      if (!(k.shift in map)) map[k.shift] = { key: k.key, shift: true };
    }
  }
  return map;
}

export const ARABIC_CHAR_MAP: Record<string, ArKeyLocation> = buildArabicCharMap();

export function locateArabicChar(ch: string | null): ArKeyLocation | null {
  if (!ch) return null;
  return ARABIC_CHAR_MAP[ch] ?? null;
}
