'use client';

import { useEffect, useRef, useState } from 'react';
import { Language, Level, Mode, QalamContent } from '@/lib/content/types';
import { getRandomScribePassage, getRaceWords } from '@/lib/content/localProvider';
import { RACE_CONFIG, AUTHENTIC_RACE_CONFIG } from '@/lib/content/raceConfig';
import ScribeView from '@/components/ScribeView';
import RaceView from '@/components/RaceView';
import HarakatView from '@/components/HarakatView';
import AuthenticSources from '@/components/AuthenticSources';
import ThemeToggle from '@/components/ThemeToggle';
import ArabicRaceStagePicker from '@/components/ArabicRaceStagePicker';
import ArabicRaceProgressive from '@/components/ArabicRaceProgressive';
import { getStageById } from '@/lib/content/arabicRaceProgression';
import { useArabicRaceProgress } from '@/hooks/useArabicRaceProgress';

type Section = 'practice' | 'authentic';

const LEVEL_LABELS: Record<Level, string> = { beginner: 'Beginner', intermediate: 'Intermediate', pro: 'Pro' };
const MODE_LABELS: Record<Mode, string> = { scribe: 'Scribe', race: 'Race', harakat: 'Harakat' };

export default function Home() {
  const [section, setSection] = useState<Section>('practice');
  const [language, setLanguage] = useState<Language>('en');
  const [level, setLevel] = useState<Level>('beginner');
  const [mode, setMode] = useState<Mode>('scribe');
  const [showSetup, setShowSetup] = useState(true);

  const [scribeContent, setScribeContent] = useState<QalamContent | null>(null);
  const [raceWords, setRaceWords] = useState<string[]>([]);
  const [raceLanguage, setRaceLanguage] = useState<Language>('en');
  const [raceStatsId, setRaceStatsId] = useState('en-beginner');
  const [raceConfig, setRaceConfig] = useState(RACE_CONFIG.en.beginner);
  const [scribeStatsId, setScribeStatsId] = useState('en-beginner');

  // Arabic Race now uses the stage/round learning path instead of the old
  // Beginner/Intermediate/Pro word list. useStageRace is only set true via
  // handleStart below (Practice setup), and explicitly false in
  // handleRaceWithWords, so the existing Authentic-Sources "Race with these
  // words" path (untouched) never gets routed through the stage system.
  const [arabicStageId, setArabicStageId] = useState<string | null>(null);
  const [useStageRace, setUseStageRace] = useState(false);

  // Guards the auto-load effect below from stomping on content that was just
  // explicitly set by "Type this" / "Race with these words" — see handleTypeThis.
  const skipNextAutoLoad = useRef(false);

  function newLocalPassage(lang: Language, lvl: Level) {
    setScribeContent(getRandomScribePassage(lang, lvl));
    setScribeStatsId(`${lang}-${lvl}`);
  }

  useEffect(() => {
    if (skipNextAutoLoad.current) {
      skipNextAutoLoad.current = false;
      return;
    }
    if (mode === 'scribe' && section === 'practice') {
      newLocalPassage(language, level);
    }
    if (mode === 'race' && section === 'practice') {
      setRaceLanguage(language);
      setRaceStatsId(`${language}-${level}`);
      setRaceConfig(RACE_CONFIG[language][level]);
      setRaceWords(getRaceWords(language, level).map((w) => w.word));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, level, mode, section]);

  // Fixes the bug where a selected Qur'an/Hadith passage was replaced by a
  // random local passage a moment after being set. The mode/section change
  // this triggers would previously re-run the effect above and overwrite
  // scribeContent — skipNextAutoLoad prevents that single re-run.
  function handleTypeThis(content: QalamContent) {
    skipNextAutoLoad.current = true;
    setSection('practice');
    setMode('scribe');
    setShowSetup(false);
    setScribeStatsId('authentic');
    setScribeContent(content);
  }

  function handleRaceWithWords(words: string[]) {
    skipNextAutoLoad.current = true;
    setSection('practice');
    setMode('race');
    setShowSetup(false);
    setUseStageRace(false);
    setRaceLanguage('ar');
    setRaceStatsId('authentic');
    setRaceConfig(AUTHENTIC_RACE_CONFIG);
    setRaceWords(words);
  }

  function handleStart() {
    const goingToStageRace = language === 'ar' && mode === 'race';
    setUseStageRace(goingToStageRace);
    // Explicitly resync from the CURRENT language/level on every Start click
    // — never rely solely on the mode/language-change effect above. That
    // effect only re-runs when a dependency's value actually changes; if the
    // user returns here via "Change" while language/level/mode already sit
    // at their prior values (e.g. after a Qur'an Race session left
    // raceLanguage='ar' behind), the effect is a no-op and the stale race
    // state would otherwise leak into an unrelated Practice session.
    if (mode === 'scribe') {
      newLocalPassage(language, level);
    } else if (mode === 'race' && !goingToStageRace) {
      setRaceLanguage(language);
      setRaceStatsId(`${language}-${level}`);
      setRaceConfig(RACE_CONFIG[language][level]);
      setRaceWords(getRaceWords(language, level).map((w) => w.word));
    }
    setShowSetup(false);
  }

  const startDisabled = language === 'ar' && mode === 'race' && !arabicStageId;
  const arabicProgress = useArabicRaceProgress();

  function getStartButtonLabel(): string {
    if (language !== 'ar' || mode !== 'race') return 'Start';
    if (!arabicStageId) return 'Select a stage to begin';
    const stage = getStageById(arabicStageId);
    if (!stage) return 'Start';
    const roundIndex = arabicProgress.getRoundIndex(stage.id);
    const catches = arabicProgress.getCatches(stage.id, roundIndex);
    const alreadyStarted = roundIndex > 0 || catches > 0;
    return `${alreadyStarted ? 'Continue' : 'Start'} Stage ${stage.order}`;
  }

  const summary =
    useStageRace && language === 'ar' && mode === 'race' && arabicStageId
      ? `Arabic \u00b7 Race \u00b7 ${getStageById(arabicStageId)?.title || 'Learning Path'}`
      : `${language === 'en' ? 'English' : 'Arabic'} \u00b7 ${LEVEL_LABELS[level]} \u00b7 ${MODE_LABELS[mode]}`;

  return (
    <div className="wrap">
      <header className="qalam-header">
        <div className="brand">
          <img src="/logo.png" alt="Qalam" className="brand-mark" />
          <div>
            <h1>Qalam</h1>
            <p>Type. Learn. Master.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <ThemeToggle />
          <div className="toggle-group">
            <button className={section === 'practice' ? 'active' : ''} onClick={() => setSection('practice')}>
              Practice
            </button>
            <button className={section === 'authentic' ? 'active' : ''} onClick={() => setSection('authentic')}>
              Authentic sources
            </button>
          </div>
        </div>
      </header>

      {section === 'practice' ? (
        <>
          {showSetup ? (
            <div className="stage">
              <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 18, marginTop: 0 }}>
                Choose language
              </h2>
              <div className="controls-row">
                <div className="toggle-group">
                  <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>
                    English <span style={{ opacity: 0.6, fontSize: 11 }}>QWERTY</span>
                  </button>
                  <button className={language === 'ar' ? 'active' : ''} onClick={() => setLanguage('ar')}>
                    {'\u0627\u0644\u0639\u0631\u0628\u064a\u0629'} <span style={{ opacity: 0.6, fontSize: 11 }}>Arabic 101</span>
                  </button>
                </div>
              </div>

              <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 18 }}>Choose practice</h2>
              <div className="controls-row">
                <div className="toggle-group">
                  <button className={mode === 'scribe' ? 'active' : ''} onClick={() => setMode('scribe')}>
                    Scribe
                  </button>
                  <button className={mode === 'race' ? 'active' : ''} onClick={() => setMode('race')}>
                    Race
                  </button>
                  {language === 'ar' && (
                    <button className={mode === 'harakat' ? 'active' : ''} onClick={() => setMode('harakat')}>
                      {'\ud83e\udeb6'} Harakat
                    </button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: -8 }}>
                {mode === 'scribe' && 'Type passages against the clock.'}
                {mode === 'race' && 'Type falling words before they reach the bottom.'}
                {mode === 'harakat' && "Master Arabic diacritics on the same keyboard mapping."}
              </p>

              {language === 'ar' && mode === 'race' ? (
                <>
                  <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 18 }}>
                    Arabic Race — Learning Path
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: -8, marginBottom: 14 }}>
                    Complete each stage to unlock the next. Your progress is saved automatically.
                  </p>
                  <ArabicRaceStagePicker selectedStageId={arabicStageId} onSelectStage={setArabicStageId} />
                  <p style={{ fontSize: 13, color: arabicStageId ? 'var(--gold)' : 'var(--muted)', marginTop: 12 }}>
                    {arabicStageId
                      ? `Selected: Stage ${getStageById(arabicStageId)?.order} \u2014 ${getStageById(arabicStageId)?.title}. Tap the button below to begin.`
                      : 'Tap a stage above to select it, then use the button below to begin.'}
                  </p>
                </>
              ) : (
                <>
                  <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 18 }}>Level</h2>
                  <div className="controls-row">
                    <div className="toggle-group">
                      <button className={level === 'beginner' ? 'active' : ''} onClick={() => setLevel('beginner')}>
                        {'\ud83c\udf31'} Beginner
                      </button>
                      <button className={level === 'intermediate' ? 'active' : ''} onClick={() => setLevel('intermediate')}>
                        {'\ud83d\udcda'} Intermediate
                      </button>
                      <button className={level === 'pro' ? 'active' : ''} onClick={() => setLevel('pro')}>
                        {'\ud83d\udd25'} Pro
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button className="primary-btn" onClick={handleStart} disabled={startDisabled} style={{ marginTop: 16 }}>
                {getStartButtonLabel()}
              </button>
            </div>
          ) : (
            <div className="controls-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{summary}</div>
              <button className="secondary-btn" onClick={() => setShowSetup(true)}>
                Change
              </button>
            </div>
          )}

          {!showSetup && (
            <>
              {mode === 'scribe' && (
                <ScribeView content={scribeContent} onNext={() => newLocalPassage(language, level)} statsId={scribeStatsId} />
              )}
              {mode === 'race' &&
                (useStageRace && language === 'ar' && arabicStageId ? (
                  <ArabicRaceProgressive stageId={arabicStageId} />
                ) : (
                  <RaceView language={raceLanguage} words={raceWords} config={raceConfig} statsId={raceStatsId} />
                ))}
              {mode === 'harakat' && <HarakatView />}
            </>
          )}
        </>
      ) : (
        <AuthenticSources onTypeThis={handleTypeThis} onRaceWithWords={handleRaceWithWords} />
      )}

      <footer className="qalam-footer">
        Switch between English QWERTY and the classic Arabic (101) layout. Type using whatever keyboard your system
        is set to.
      </footer>
    </div>
  );
}
