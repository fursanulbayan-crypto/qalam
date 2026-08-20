# Qalam — Arabic & English typing trainer

## Important: still built without network access

I still have no internet access in this sandbox, so nothing here has been
run — no `npm install`, `next dev`, or `next build`. Every change was
verified as far as static analysis and standalone logic checks can go (see
"What was actually tested" below), but you are the first to run the app.

## Setup

```bash
npm install
cp .env.example .env.local
# edit .env.local: HADITH_API_KEY=your-key-from-hadithapi.com
npm run dev
```

Open http://localhost:3000.

## What changed in this pass

**1. Critical bug — selected Qur'an/Hadith passage was overwritten.**
The effect that auto-loads a random local passage whenever `mode`/`section`
changes was also firing right after "Type this" / "Race with these words"
set the real content — silently replacing it a moment later. Fixed with a
`skipNextAutoLoad` ref that suppresses exactly one re-run when content was
just set explicitly. `src/app/page.tsx`.

**2. Hadith requests failing — my own regression, now reverted.**
In the last session I "verified" the Hadith endpoint against
`hadithapi.com/public/docs/*` and changed the base URL to
`.../public/api/...`. That doc path turned out to be a stale/legacy
snapshot. I re-checked against the *current* docs at
`hadithapi.com/docs/{books,chapters,hadiths}` (self-referencing nav,
live-looking session tokens) — all three consistently show the base as
`https://hadithapi.com/api/...`, no `/public/`. Reverted. Also added
server-side diagnostic logging (status code + response body snippet, apiKey
redacted) on failure, and hardened response parsing to try a few plausible
shapes since hadithapi.com still publishes no sample response body.
`src/lib/content/hadithProvider.ts`.

**3. Content integrity — authentic sources no longer silently substitute
local content.** Previously, if a Qur'an ayah or Hadith fetch failed *after*
being specifically requested, `contentManager.ts` quietly swapped in a
random local Arabic passage. That's now removed: a failed request returns
no data and the message *"Connect to the internet to explore authentic
sources."* Practice mode's local content (which never touches this file)
is unaffected either way. `src/lib/content/contentManager.ts`.

**4. Race speed centralized and rebalanced.** All spawn/fall-speed numbers
moved out of `RaceView.tsx` into `src/lib/content/raceConfig.ts`, keyed by
language × level. Arabic starts and ramps slower than English at every
level (reading unfamiliar script + locating a shifted key both take
longer), and the ramp step sizes are small so speed increases gradually
rather than jumping.

**5. Theme: System / Light / Dark.** New `ThemeToggle` component, persisted
to `localStorage`, defaults to System. A small inline script in
`layout.tsx` applies the stored/OS theme before first paint (no flash).
Light-theme CSS variables added to `globals.css` — same ink/parchment/gold
identity, inverted for daytime reading.

**6. Stats: Errors + persisted best.** `StatsBar` now shows an Errors count
in both Scribe and Race. Best WPM (Scribe) and best score (Race) persist
per language+level in `localStorage` via `usePersistedBest` — no account.

**7. UX: progressive disclosure for Practice.** Practice now opens on a
"Choose language → Choose practice → Level" setup card; once you hit Start
it collapses to a one-line summary with a Change link, instead of three
toggle rows sitting on screen permanently. Authentic Sources got a short
descriptive line under the Qur'an/Hadith toggle. Visual identity (fonts,
colors, layout shell) is unchanged.

**8. Arabic 101 keyboard, Harakat Challenge, RTL, Scribe, Race, English
QWERTY, Latin number row: untouched**, and re-verified against the same
16-character test list from the last pass (all PASS — see below). No second
keyboard mapping exists; Harakat Challenge reuses the same `Keyboard`
component as Scribe/Race.

## Harakat Challenge — one thing worth knowing (not changed)

I checked whether the curated content bank's `harakat_challenge` stages
actually exercise all 8 diacritics you asked me to test. Fatha, damma,
kasra, sukun, and shadda all appear in the drill items. **Fathatan,
dammatan, and kasratan (the three tanween marks) don't currently appear in
any drill item** — the keyboard maps them correctly (Shift+W, Shift+R,
Shift+S), but nothing in the existing curated bank practices them. I didn't
touch the content bank since you've said not to modify it — flagging this
so you can decide whether to add tanween items later.

## Browser / localhost troubleshooting (item 9)

`localhost` in a browser always means *the machine that browser is running
on*, regardless of which browser it is. If `next dev` opened correctly in
Edge but Chrome on the *same PC* shows nothing at `http://localhost:3000`,
that's almost always one of:

- Chrome has a different proxy/VPN/extension intercepting `localhost`
  (check `chrome://net-internals` or try Chrome in an Incognito window with
  extensions disabled).
- A previous process is still bound to port 3000 in a way only Edge's
  connection survived — stop `next dev`, confirm the port is free, restart.
- Chrome's DNS-over-HTTPS or a "secure DNS" setting resolving `localhost`
  oddly — try `http://127.0.0.1:3000` directly.

Nothing in Qalam's code is browser-specific — no `webkit`-prefixed APIs, no
`navigator.userAgent` sniffing, no browser-only storage besides
`localStorage` (guarded with try/catch everywhere it's used, so it degrades
gracefully rather than crashing). I couldn't reproduce or rule out a
Chrome-specific issue without a browser to test in, so if it persists after
the above, it's worth checking Chrome's own `chrome://net-export` log.

## Testing from another device on your network (item 10)

`localhost` only ever means "this device" — to reach the dev server from a
phone, bind Next.js to all network interfaces and use the PC's LAN IP:

```bash
# Windows
npm.cmd run dev -- --hostname 0.0.0.0

# macOS/Linux
npm run dev -- --hostname 0.0.0.0
```

Then find your PC's LAN IP (`ipconfig` on Windows, `ifconfig`/`ip addr` on
macOS/Linux — look for something like `192.168.x.x`), and on the phone
(same Wi-Fi network) open `http://192.168.x.x:3000`.

This is a development-only convenience — don't bind to `0.0.0.0` in
production; Vercel handles that correctly on its own. The Hadith key stays
server-side either way, since the phone is just talking to your PC's
Next.js server the same way a desktop browser would — it never sees
`HADITH_API_KEY`.

## What was actually tested (and what wasn't)

**Tested, programmatically, against the real shipped files:**
- 0 TypeScript syntax errors across all 23 `.ts`/`.tsx` files.
- The Arabic 101 base+shift character map — all 16 requested test
  characters (ا أ إ آ ؤ ئ لأ لآ + 8 harakat) resolve to the exact key/Shift
  state specified, re-run against this pass's file (unchanged from last
  time, confirmed still correct).
- Provider boundaries: `quranProvider`/`hadithProvider` are imported only
  by their own `route.ts` files — grepped the whole `src` tree.
- `HADITH_API_KEY` appears only inside `hadithProvider.ts`; no
  `NEXT_PUBLIC_` variables anywhere.
- Every client component has `'use client'`.
- Every `localStorage` call is inside a try/catch or an SSR-safe check.
- No browser-specific API usage anywhere in `src`.
- The content bank JSON import resolves and the file exists at the
  expected path.
- Confirmed (via a small Python check) which harakat the curated content
  bank actually drills — see the Harakat note above.

**Not tested, because I have no browser/runtime here:**
- `npm run dev` actually starting.
- Whether Hadith requests now succeed with a real key — the base-URL fix is
  my best verified read of hadithapi.com's *current* docs, but I was wrong
  about this once already this project, so please treat it as
  "high-confidence, not proven" until you've run it. If
  `/api/hadith?action=collections` still fails, check your server console
  for the new diagnostic log line — it'll show the real status code and
  response body (key redacted).
- Whether the Qur'an/Race bug fix behaves correctly in the browser (the
  logic is straightforward and I'm confident in it, but only a real click
  confirms it).
- Visual appearance of the Light theme, the new setup card, or Errors/Best
  stats — no renderer available here.
- Chrome-vs-Edge on your PC specifically — see the troubleshooting note.

## Local testing steps

1. `npm install && cp .env.example .env.local` (add your real
   `HADITH_API_KEY`), `npm run dev`.
2. **Qur'an bug fix**: Authentic Sources → Qur'an → pick a specific surah
   and ayah (e.g. Al-Fatihah, ayah 1) → Load ayah → Type this. Confirm
   Scribe shows *exactly* that ayah, not a random Arabic passage.
3. **Race from a passage**: same ayah → Race with these words → confirm
   the falling words come from that ayah, not local vocabulary.
4. **Hadith**: `/api/hadith?action=collections` then
   `/api/hadith?action=byCollection&slug=sahih-bukhari` — if either fails,
   check the server terminal for the logged status+body.
5. **Offline behavior**: turn off Wi-Fi, confirm Practice (all
   languages/levels/modes) still works, and Authentic Sources shows
   "Connect to the internet..." rather than a broken screen or fake content.
6. **Race feel**: try Arabic Beginner vs English Beginner — Arabic should
   read as noticeably calmer.
7. **Theme**: toggle System/Light/Dark, reload the page, confirm it
   persisted and there's no flash of the wrong theme.
8. **Mobile**: `npm run dev -- --hostname 0.0.0.0`, open
   `http://<your-LAN-IP>:3000` on a phone, check the layout at that width.
9. `npm run build` for a production build check.

## Environment variables required

- `HADITH_API_KEY` — from hadithapi.com/profile. Qur'an needs none.

## Deploying to Vercel

Same as before: push to GitHub, import in Vercel, add `HADITH_API_KEY`
under Project Settings → Environment Variables.
